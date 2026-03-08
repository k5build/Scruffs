import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { generateBookingRef, getServicePrice, getServiceDurationV2, calcAddonsPrice, calcAddonsDuration, calcLoyaltyPoints, recalcTier, addMinutesToTime } from '@/lib/utils';
import { verifyToken, SESSION_COOKIE } from '@/lib/auth';
import { sendAllNotifications } from '@/lib/notifications';
import { getAvailableStartTimes } from '@/lib/scheduling';
import type { ServiceLevel } from '@/lib/utils';

const PetEntrySchema = z.object({
  name:       z.string().min(1),
  type:       z.enum(['DOG', 'CAT']),
  breed:      z.string().min(1),
  size:       z.enum(['SMALL', 'MEDIUM', 'LARGE', 'XL']).nullable().optional(),
  age:        z.string().min(1),
  notes:      z.string().optional().default(''),
  service:    z.enum(['BASIC', 'SPECIAL', 'FULL']),
  addons:     z.array(z.string()).optional().default([]),
  savedPetId: z.string().optional(),
});

const CreateBookingSchema = z.object({
  pets:          z.array(PetEntrySchema).min(1).max(5),
  slotDate:      z.string().min(1),
  slotStartTime: z.string().regex(/^\d{2}:\d{2}$/),
  area:          z.string().min(1),
  address:       z.string().min(1),
  buildingNote:  z.string().optional(),
  mapsLink:      z.string().optional(),
  ownerName:     z.string().min(1),
  ownerEmail:    z.string().email().optional().or(z.literal('')),
  ownerPhone:    z.string().min(8),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = CreateBookingSchema.parse(body);

    // Server-side recalculate price and duration per pet (including add-ons)
    const petsWithCalc = data.pets.map((p) => {
      const service  = p.service as ServiceLevel;
      const addons   = p.addons ?? [];
      const price    = getServicePrice(p.type, p.size ?? null, service) + calcAddonsPrice(addons, p.type);
      const duration = getServiceDurationV2(p.type, p.size ?? null, service) + calcAddonsDuration(addons);
      return { ...p, addons, price, duration };
    });

    const totalPrice    = petsWithCalc.reduce((s, p) => s + p.price, 0);
    const totalDuration = petsWithCalc.reduce((s, p) => s + p.duration, 0);

    // Verify slot is still available
    const available = await getAvailableStartTimes(data.slotDate, totalDuration);
    const slotOk    = available.some((s) => s.startTime === data.slotStartTime);
    if (!slotOk) {
      return NextResponse.json({ error: 'Selected time slot is no longer available' }, { status: 409 });
    }

    // Get logged-in user (optional)
    let userId: string | null = null;
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (token) {
      const payload = await verifyToken(token);
      if (payload) userId = payload.userId;
    }

    const bookingRef  = generateBookingRef();
    const slotEndTime = addMinutesToTime(data.slotStartTime, totalDuration);

    // Use pets[0] for top-level backward-compat fields
    const primary = petsWithCalc[0];

    // Create TimeSlot record
    const slot = await prisma.timeSlot.upsert({
      where:  { date_startTime: { date: data.slotDate, startTime: data.slotStartTime } },
      update: {},
      create: { date: data.slotDate, startTime: data.slotStartTime, endTime: slotEndTime, isAvailable: false },
    });

    // If the slot already existed and has a booking, reject
    const existingBooking = await prisma.booking.findFirst({ where: { slotId: slot.id } });
    if (existingBooking) {
      return NextResponse.json({ error: 'Selected time slot is no longer available' }, { status: 409 });
    }

    // Mark slot unavailable
    await prisma.timeSlot.update({ where: { id: slot.id }, data: { isAvailable: false } });

    const booking = await prisma.booking.create({
      data: {
        bookingRef,
        // Primary pet (backward compat)
        petType:      primary.type,
        petName:      primary.name,
        petBreed:     primary.breed,
        petAge:       primary.age,
        petSize:      primary.size ?? null,
        petNotes:     primary.notes ?? null,
        petId:        primary.savedPetId ?? null,
        service:      primary.service,
        addons:       '[]',
        // Multi-pet JSON
        pets:         JSON.stringify(petsWithCalc),
        price:        totalPrice,
        duration:     totalDuration,
        area:         data.area,
        address:      data.address,
        buildingNote: data.buildingNote ?? null,
        mapsLink:     data.mapsLink ?? null,
        ownerName:    data.ownerName,
        ownerEmail:   data.ownerEmail || null,
        ownerPhone:   data.ownerPhone,
        userId,
        slotId:       slot.id,
        status:       'CONFIRMED',
      },
      include: { slot: true },
    });

    // Auto-save new pets to user profile (DB)
    if (userId) {
      for (const p of petsWithCalc) {
        if (!p.savedPetId) {
          try {
            const existing = await prisma.pet.findFirst({ where: { userId, name: p.name, breed: p.breed } });
            if (!existing) {
              const count = await prisma.pet.count({ where: { userId } });
              if (count < 5) {
                await prisma.pet.create({
                  data: { userId, name: p.name, type: p.type, breed: p.breed, size: p.size ?? null, age: p.age, notes: p.notes ?? null },
                });
              }
            }
          } catch { /* ignore */ }
        }
      }
    }

    // Award loyalty points
    if (userId) {
      try {
        const pts  = calcLoyaltyPoints(totalPrice);
        const user = await prisma.user.update({ where: { id: userId }, data: { loyaltyPoints: { increment: pts } } });
        const newTier = recalcTier(user.loyaltyPoints);
        await prisma.user.update({ where: { id: userId }, data: { loyaltyTier: newTier } });
        await prisma.loyaltyTransaction.create({
          data: { userId, points: pts, reason: 'BOOKING_EARN', note: `Booking ${bookingRef}`, bookingId: booking.id },
        });
        await prisma.booking.update({ where: { id: booking.id }, data: { loyaltyPointsEarned: pts } });
      } catch { /* loyalty failure must not block booking */ }
    }

    // Send notifications (non-blocking)
    const petNamesLabel = petsWithCalc.map((p) => p.name).join(', ');
    sendAllNotifications({
      bookingRef:    booking.bookingRef,
      petName:       petNamesLabel,
      petBreed:      primary.breed,
      petType:       primary.type,
      petSize:       booking.petSize,
      service:       primary.service,
      addons:        '[]',
      price:         booking.price,
      duration:      booking.duration,
      slotDate:      booking.slot.date,
      slotStartTime: booking.slot.startTime,
      area:          booking.area,
      address:       booking.address,
      buildingNote:  booking.buildingNote,
      mapsLink:      booking.mapsLink,
      ownerName:     booking.ownerName,
      ownerPhone:    booking.ownerPhone,
      ownerEmail:    booking.ownerEmail,
    }).catch(console.error);

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 422 });
    }
    console.error('POST /api/bookings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
