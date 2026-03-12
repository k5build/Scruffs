import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

/** Strip dangerous values from promo fields before writing to DB */
function sanitizePromoData(data: Record<string, unknown>): Record<string, unknown> {
  const sanitized = { ...data };
  // Validate ctaUrl — must be a real https URL or relative path
  if (sanitized.ctaUrl !== undefined && sanitized.ctaUrl !== null) {
    try {
      const url = new URL(String(sanitized.ctaUrl), 'https://scruffs.ae');
      // Allow https or relative paths only — block javascript:, data:, etc.
      if (url.protocol !== 'https:' && url.protocol !== 'http:') {
        sanitized.ctaUrl = '/';
      }
    } catch {
      sanitized.ctaUrl = '/';
    }
  }
  // Validate hex colors
  if (sanitized.bgColor && !HEX_COLOR.test(String(sanitized.bgColor))) {
    sanitized.bgColor = '#3A4F4A';
  }
  if (sanitized.textColor && !HEX_COLOR.test(String(sanitized.textColor))) {
    sanitized.textColor = '#DBD4C7';
  }
  return sanitized;
}

export async function GET(request: NextRequest) {
  if (!await isAdminRequest(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const promotions = await prisma.promotion.findMany({ orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }] });
  return NextResponse.json({ promotions });
}

export async function POST(request: NextRequest) {
  if (!await isAdminRequest(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updated = await prisma.promotion.update({ where: { id }, data: sanitizePromoData(data) as any });
    return NextResponse.json({ promotion: updated });
  }

  // create
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const promo = await prisma.promotion.create({ data: sanitizePromoData(data) as any });
  return NextResponse.json({ promotion: promo });
}
