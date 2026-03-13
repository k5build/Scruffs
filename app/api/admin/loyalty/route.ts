import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { recalcTier } from '@/lib/utils';
import { isAdminRequest } from '@/lib/adminAuth';
import { audit } from '@/lib/audit';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

const SERVICE = 'admin-loyalty';

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

  const ip        = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? 'unknown';
  const userAgent = request.headers.get('user-agent') ?? undefined;

  const { userId, points, reason, note } = await request.json() as {
    userId: string;
    points: number;
    reason: string;
    note?:  string;
  };

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

  // Audit log
  await audit({
    action:   'loyalty.points_awarded',
    actor:    'admin',
    targetId: userId,
    ip,
    userAgent,
    details:  { points, reason, newTier },
  });

  logger.info(SERVICE, 'Loyalty points updated', {
    userId,
    action: 'loyalty.points_awarded',
  });

  return NextResponse.json({ success: true, newPoints: user.loyaltyPoints, newTier });
}
