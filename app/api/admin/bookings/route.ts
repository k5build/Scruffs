import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/adminAuth';
import { decryptField } from '@/lib/crypto';
import { logger } from '@/lib/logger';

const SERVICE = 'admin-bookings';

/** Decrypt PII fields on a booking record. */
function decryptBooking<T extends {
  ownerName:    string;
  ownerPhone:   string;
  ownerEmail:   string | null;
  address:      string;
  buildingNote: string | null;
}>(booking: T): T {
  return {
    ...booking,
    ownerName:    decryptField(booking.ownerName),
    ownerPhone:   decryptField(booking.ownerPhone),
    ownerEmail:   booking.ownerEmail   ? decryptField(booking.ownerEmail)   : null,
    address:      decryptField(booking.address),
    buildingNote: booking.buildingNote ? decryptField(booking.buildingNote) : null,
  };
}

export async function GET(request: NextRequest) {
  if (!await isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const date   = searchParams.get('date');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (date)   where.slot   = { date };

    const page  = Math.max(1, parseInt(searchParams.get('page')  ?? '1',   10));
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') ?? '200', 10)));

    const bookings = await prisma.booking.findMany({
      where,
      include:  { slot: true },
      orderBy:  { createdAt: 'desc' },
      take:     limit,
      skip:     (page - 1) * limit,
    });

    // Decrypt PII before returning to admin UI
    const decrypted = bookings.map(decryptBooking);

    return NextResponse.json({ bookings: decrypted });
  } catch (error) {
    logger.error(SERVICE, 'GET /api/admin/bookings error', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
