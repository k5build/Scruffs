import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { recalcTier } from '@/lib/utils';
import { isAdminRequest } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

/** GET /api/admin/loyalty?q=searchterm — search users */
export async function GET(request: NextRequest) {
  if (!await isAdminRequest(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const q = request.nextUrl.searchParams.get('q') ?? '';
  const users = await prisma.user.findMany({
    where: q ? {
      OR: [
        { name:  { contains: q, mode: 'insensitive' } },
        { phone: { contains: q } },
        { email: { contains: q, mode: 'insensitive' } },
      ],
    } : {},
    include: { loyaltyTransactions: { orderBy: { createdAt: 'desc' }, take: 10 } },
    orderBy: { loyaltyPoints: 'desc' },
    take: 30,
  });

  return NextResponse.json({ users });
}

/** POST /api/admin/loyalty — award or deduct points */
export async function POST(request: NextRequest) {
  if (!await isAdminRequest(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { userId, points, reason, note } = await request.json();
  if (!userId || typeof points !== 'number' || !reason) {
    return NextResponse.json({ error: 'userId, points, reason required' }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data:  { loyaltyPoints: { increment: points } },
  });

  const newTier = recalcTier(user.loyaltyPoints);
  await prisma.user.update({ where: { id: userId }, data: { loyaltyTier: newTier } });

  await prisma.loyaltyTransaction.create({
    data: { userId, points, reason, note: note ?? (points > 0 ? 'Admin award' : 'Admin deduction') },
  });

  return NextResponse.json({ success: true, newPoints: user.loyaltyPoints, newTier });
}
