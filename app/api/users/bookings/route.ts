import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, SESSION_COOKIE } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const bookings = await prisma.booking.findMany({
      where:   { userId: payload.userId },
      include: { slot: true },
      orderBy: { createdAt: 'desc' },
      take:    20,
    });

    return NextResponse.json({ bookings });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
