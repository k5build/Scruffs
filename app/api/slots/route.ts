import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureSlotsExist } from '@/lib/scheduling';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json({ error: 'date param required' }, { status: 400 });
    }

    // Ensure slots exist for the requested date only
    await ensureSlotsExist(date);

    const slots = await prisma.timeSlot.findMany({
      where: {
        date,
        isAvailable: true,
        booking: null,
      },
      orderBy: { startTime: 'asc' },
    });

    return NextResponse.json({ slots });
  } catch (error) {
    console.error('GET /api/slots error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
