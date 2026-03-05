import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { generateBookingRef } from '@/lib/utils';
import { verifyToken, SESSION_COOKIE } from '@/lib/auth';
import { sendAllNotifications } from '@/lib/notifications';

const CreateBookingSchema = z.object({
  petType:     z.enum(['DOG', 'CAT']),
  petName:     z.string().min(1),
  petBreed:    z.string().min(1),
  petAge:      z.string().min(1),
  petSize:     z.enum(['SMALL', 'MEDIUM', 'LARGE']).nullable().optional(),
  petNotes:    z.string().optional(),
  petId:       z.string().optional(),           // linked pet profile
  service:     z.enum(['BASIC', 'SPECIAL', 'FULL']),
  price:       z.number().positive(),
  duration:    z.number().int().positive().optional(),
  area:        z.string().min(1),
  address:     z.string().min(1),
  buildingNote: z.string().optional(),
  mapsLink:    z.string().optional(),
  slotId:      z.string().min(1),
  ownerName:   z.string().min(1),
  ownerEmail:  z.string().email().optional().or(z.literal('')),
  ownerPhone:  z.string().min(8),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = CreateBookingSchema.parse(body);

    // Verify slot is still available
    const slot = await prisma.timeSlot.findUnique({
      where:   { id: data.slotId },
      include: { booking: true },
    });
    if (!slot) return NextResponse.json({ error: 'Slot not found' }, { status: 404 });
    if (!slot.isAvailable || slot.booking) {
      return NextResponse.json({ error: 'Slot is no longer available' }, { status: 409 });
    }

    // Get logged-in user (optional)
    let userId: string | null = null;
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (token) {
      const payload = await verifyToken(token);
      if (payload) userId = payload.userId;
    }

    const bookingRef = generateBookingRef();

    const booking = await prisma.booking.create({
      data: {
        bookingRef,
        petType:      data.petType,
        petName:      data.petName,
        petBreed:     data.petBreed,
        petAge:       data.petAge,
        petSize:      data.petSize ?? null,
        petNotes:     data.petNotes ?? null,
        petId:        data.petId ?? null,
        service:      data.service,
        price:        data.price,
        duration:     data.duration ?? 60,
        area:         data.area,
        address:      data.address,
        buildingNote: data.buildingNote ?? null,
        mapsLink:     data.mapsLink ?? null,
        ownerName:    data.ownerName,
        ownerEmail:   data.ownerEmail || null,
        ownerPhone:   data.ownerPhone,
        userId:       userId,
        slotId:       data.slotId,
        status:       'CONFIRMED',
      },
      include: { slot: true },
    });

    // Mark slot unavailable
    await prisma.timeSlot.update({
      where: { id: data.slotId },
      data:  { isAvailable: false },
    });

    // Auto-save pet to user's DB profile if logged in and new pet
    if (userId && !data.petId) {
      const existingPet = await prisma.pet.findFirst({
        where: { userId, name: data.petName, breed: data.petBreed },
      });
      if (!existingPet) {
        try {
          const petCount = await prisma.pet.count({ where: { userId } });
          if (petCount < 5) {
            await prisma.pet.create({
              data: {
                userId,
                name:  data.petName,
                type:  data.petType,
                breed: data.petBreed,
                size:  data.petSize ?? null,
                age:   data.petAge,
                notes: data.petNotes ?? null,
              },
            });
          }
        } catch { /* ignore pet save failure */ }
      }
    }

    // Send all notifications (email + WhatsApp) — non-blocking
    sendAllNotifications({
      bookingRef:    booking.bookingRef,
      petName:       booking.petName,
      petBreed:      booking.petBreed,
      petType:       booking.petType,
      petSize:       booking.petSize,
      service:       booking.service,
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
