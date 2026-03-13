import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, SESSION_COOKIE } from '@/lib/auth';
import { decryptField } from '@/lib/crypto';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const booking = await prisma.booking.findFirst({
      where:   { id: params.id, userId: payload.userId },
      include: { slot: true },
    });
    if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Decrypt PII fields before returning to client
    const decrypted = {
      ...booking,
      ownerName:    decryptField(booking.ownerName),
      ownerPhone:   decryptField(booking.ownerPhone),
      ownerEmail:   booking.ownerEmail    ? decryptField(booking.ownerEmail)    : null,
      address:      decryptField(booking.address),
      buildingNote: booking.buildingNote  ? decryptField(booking.buildingNote)  : null,
    };

    return NextResponse.json({ booking: decrypted });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
