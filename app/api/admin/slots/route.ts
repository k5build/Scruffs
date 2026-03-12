import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureSlotsExist } from '@/lib/scheduling';
import { isAdminRequest } from '@/lib/adminAuth';

export async function GET(request: NextRequest) {
  if (!await isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  if (!date) {
    return NextResponse.json({ error: 'date param required' }, { status: 400 });
  }

  await ensureSlotsExist(date);

  const slots = await prisma.timeSlot.findMany({
    where: { date },
    include: { booking: true },
    orderBy: { startTime: 'asc' },
  });

  return NextResponse.json({ slots });
}

export async function PATCH(request: NextRequest) {
  if (!await isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { slotId, isAvailable } = await request.json();

  const slot = await prisma.timeSlot.update({
    where: { id: slotId },
    data:  { isAvailable },
  });

  return NextResponse.json({ slot });
}
