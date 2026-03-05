import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, SESSION_COOKIE } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function getUserId(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  return payload?.userId ?? null;
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const userId = await getUserId(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Verify ownership
  const pet = await prisma.pet.findUnique({ where: { id: params.id } });
  if (!pet || pet.userId !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await prisma.pet.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
