import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, SESSION_COOKIE } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!token) return NextResponse.json({ user: null });

    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ user: null });

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, phone: true, name: true, email: true, createdAt: true },
    });

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null });
  }
}
