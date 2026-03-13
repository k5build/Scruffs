import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/adminAuth';
import { audit } from '@/lib/audit';
import { logger } from '@/lib/logger';

const SERVICE = 'admin-bookings-id';

const UpdateSchema = z.object({
  status:     z.enum(['PENDING','CONFIRMED','IN_PROGRESS','COMPLETED','CANCELLED']).optional(),
  adminNotes: z.string().optional(),
});

function getIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  );
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!await isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const ip        = getIp(request);
  const userAgent = request.headers.get('user-agent') ?? undefined;

  try {
    const body = await request.json();
    const data = UpdateSchema.parse(body);

    const booking = await prisma.booking.update({
      where:   { id: params.id },
      data,
      include: { slot: true },
    });

    // If cancelled, free up the slot
    if (data.status === 'CANCELLED') {
      await prisma.timeSlot.update({
        where: { id: booking.slotId },
        data:  { isAvailable: true },
      });
    }

    // Audit log
    await audit({
      action:    'booking.status_changed',
      actor:     'admin',
      targetId:  params.id,
      ip,
      userAgent,
      details:   { newStatus: data.status, bookingRef: booking.bookingRef },
    });

    logger.info(SERVICE, 'Booking status updated', {
      bookingId: params.id,
      action:    'booking.status_changed',
    });

    return NextResponse.json({ booking });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 422 });
    }
    logger.error(SERVICE, 'PATCH /api/admin/bookings/[id] error', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!await isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const ip        = getIp(request);
  const userAgent = request.headers.get('user-agent') ?? undefined;

  try {
    const booking = await prisma.booking.findUnique({
      where:  { id: params.id },
      select: { id: true, slotId: true, bookingRef: true },
    });

    if (booking) {
      await prisma.timeSlot.update({
        where: { id: booking.slotId },
        data:  { isAvailable: true },
      });
    }

    await prisma.booking.delete({ where: { id: params.id } });

    // Audit log
    await audit({
      action:   'booking.deleted',
      actor:    'admin',
      targetId: params.id,
      ip,
      userAgent,
      details:  { bookingRef: booking?.bookingRef ?? null },
    });

    logger.info(SERVICE, 'Booking deleted', {
      bookingId: params.id,
      action:    'booking.deleted',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error(SERVICE, 'DELETE /api/admin/bookings/[id] error', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
