import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyToken, SESSION_COOKIE } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const PetSchema = z.object({
  name:  z.string().min(1).max(50),
  type:  z.enum(['DOG', 'CAT']),
  breed: z.string().min(1),
  size:  z.enum(['SMALL', 'MEDIUM', 'LARGE']).nullable().optional(),
  age:   z.string().min(1),
  notes: z.string().optional(),
});

async function getUser(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload) return null;
  return prisma.user.findUnique({ where: { id: payload.userId } });
}

export async function GET(request: NextRequest) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const pets = await prisma.pet.findMany({
    where:   { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ pets });
}

export async function POST(request: NextRequest) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const data = PetSchema.parse(body);

    // Check max 5 pets
    const count = await prisma.pet.count({ where: { userId: user.id } });
    if (count >= 5) return NextResponse.json({ error: 'Max 5 pets allowed' }, { status: 400 });

    const pet = await prisma.pet.create({
      data: { ...data, size: data.size ?? null, notes: data.notes ?? null, userId: user.id },
    });
    return NextResponse.json({ pet }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: 'Validation failed' }, { status: 422 });
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
