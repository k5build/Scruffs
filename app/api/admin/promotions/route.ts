import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function isAdminAuthed(request: NextRequest): boolean {
  const token  = request.cookies.get('admin_auth')?.value;
  const secret = process.env.ADMIN_SECRET ?? 'scruffs2024';
  return token === secret;
}

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!isAdminAuthed(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const promotions = await prisma.promotion.findMany({ orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }] });
  return NextResponse.json({ promotions });
}

export async function POST(request: NextRequest) {
  if (!isAdminAuthed(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { action, id, ...data } = body;

  if (action === 'delete') {
    await prisma.promotion.delete({ where: { id } });
    return NextResponse.json({ success: true });
  }

  if (action === 'toggle') {
    const promo = await prisma.promotion.findUnique({ where: { id } });
    if (!promo) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const updated = await prisma.promotion.update({ where: { id }, data: { active: !promo.active } });
    return NextResponse.json({ promotion: updated });
  }

  if (action === 'update') {
    const updated = await prisma.promotion.update({ where: { id }, data });
    return NextResponse.json({ promotion: updated });
  }

  // create
  const promo = await prisma.promotion.create({ data });
  return NextResponse.json({ promotion: promo });
}
