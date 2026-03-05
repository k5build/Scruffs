import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function isAdmin(request: NextRequest) {
  const token = request.cookies.get('admin_auth')?.value;
  return token === (process.env.ADMIN_SECRET ?? 'scruffs-admin');
}

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const date   = searchParams.get('date');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (date) where.slot = { date };

    const bookings = await prisma.booking.findMany({
      where,
      include: { slot: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('GET /api/admin/bookings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
