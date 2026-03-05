import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { generateBookingRef } from '@/lib/utils';

const CreateBookingSchema = z.object({
  petType:     z.enum(['DOG', 'CAT']),
  petName:     z.string().min(1),
  petBreed:    z.string().min(1),
  petAge:      z.string().min(1),
  petSize:     z.enum(['SMALL', 'MEDIUM', 'LARGE']).nullable().optional(),
  petNotes:    z.string().optional(),
  service:     z.enum(['BASIC', 'SPECIAL', 'FULL']),
  price:       z.number().positive(),
  duration:    z.number().int().positive().optional(),
  area:        z.string().min(1),
  address:     z.string().min(1),
  buildingNote: z.string().optional(),
  mapsLink:    z.string().optional(),
  slotId:      z.string().min(1),
  ownerName:   z.string().min(1),
  ownerEmail:  z.string().email().optional(),
  ownerPhone:  z.string().min(8),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = CreateBookingSchema.parse(body);

    // Verify slot is still available
    const slot = await prisma.timeSlot.findUnique({
      where: { id: data.slotId },
      include: { booking: true },
    });

    if (!slot) {
      return NextResponse.json({ error: 'Slot not found' }, { status: 404 });
    }
    if (!slot.isAvailable || slot.booking) {
      return NextResponse.json({ error: 'Slot is no longer available' }, { status: 409 });
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
        service:      data.service,
        price:        data.price,
        duration:     data.duration ?? 60,
        area:         data.area,
        address:      data.address,
        buildingNote: data.buildingNote ?? null,
        mapsLink:     data.mapsLink ?? null,
        ownerName:    data.ownerName,
        ownerEmail:   data.ownerEmail ?? null,
        ownerPhone:   data.ownerPhone,
        slotId:       data.slotId,
        status:       'CONFIRMED',
      },
      include: { slot: true },
    });

    // Mark slot as unavailable
    await prisma.timeSlot.update({
      where: { id: data.slotId },
      data:  { isAvailable: false },
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 422 });
    }
    console.error('POST /api/bookings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
