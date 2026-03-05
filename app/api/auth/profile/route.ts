import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyToken, SESSION_COOKIE } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const UpdateSchema = z.object({
  name:  z.string().min(1).max(80).optional(),
  email: z.string().email().optional().or(z.literal('')),
});

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const data = UpdateSchema.parse(body);

    const user = await prisma.user.update({
      where: { id: payload.userId },
      data: {
        ...(data.name  !== undefined ? { name:  data.name  } : {}),
        ...(data.email !== undefined ? { email: data.email || null } : {}),
      },
      select: { id: true, phone: true, name: true, email: true },
    });

    return NextResponse.json({ user });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: 'Validation failed' }, { status: 422 });
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
