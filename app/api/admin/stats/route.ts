import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';
import { isAdminRequest } from '@/lib/adminAuth';

export async function GET(request: NextRequest) {
  if (!await isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const today = format(new Date(), 'yyyy-MM-dd');

    const [
      totalBookings,
      todayBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      revenueData,
      upcomingBookings,
    ] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({ where: { slot: { date: today } } }),
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.booking.count({ where: { status: 'CONFIRMED' } }),
      prisma.booking.count({ where: { status: 'COMPLETED' } }),
      prisma.booking.count({ where: { status: 'CANCELLED' } }),
      prisma.booking.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { price: true },
      }),
      prisma.booking.findMany({
        where: {
          slot: { date: { gte: today } },
          status: { in: ['CONFIRMED', 'PENDING'] },
        },
        include: { slot: true },
        orderBy: [{ slot: { date: 'asc' } }, { slot: { startTime: 'asc' } }],
        take: 10,
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalBookings,
        todayBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
        totalRevenue: revenueData._sum.price ?? 0,
      },
      upcomingBookings,
    });
  } catch (error) {
    console.error('GET /api/admin/stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
