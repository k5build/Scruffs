import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

function isAdmin(request: NextRequest) {
  const token = request.cookies.get('admin_auth')?.value;
  return token === (process.env.ADMIN_SECRET ?? 'scruffs-admin');
}

const UpdateSchema = z.object({
  status:     z.enum(['PENDING','CONFIRMED','IN_PROGRESS','COMPLETED','CANCELLED']).optional(),
  adminNotes: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = UpdateSchema.parse(body);

    const booking = await prisma.booking.update({
      where: { id: params.id },
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

    return NextResponse.json({ booking });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 422 });
    }
    console.error('PATCH /api/admin/bookings/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const booking = await prisma.booking.findUnique({ where: { id: params.id } });
    if (booking) {
      await prisma.timeSlot.update({
        where: { id: booking.slotId },
        data:  { isAvailable: true },
      });
    }

    await prisma.booking.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/admin/bookings/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
