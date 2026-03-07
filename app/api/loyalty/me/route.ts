import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [transactions, bookingCount] = await Promise.all([
    prisma.loyaltyTransaction.findMany({
      where:   { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take:    20,
    }),
    prisma.loyaltyTransaction.count({
      where: { userId: user.id, reason: 'BOOKING_EARN' },
    }),
  ]);

  return NextResponse.json({
    points:       user.loyaltyPoints,
    tier:         user.loyaltyTier,
    name:         user.name,
    phone:        user.phone,
    email:        user.email,
    userId:       user.id,
    bookingCount,
    transactions,
  });
}
