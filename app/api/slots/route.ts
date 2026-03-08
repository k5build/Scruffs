import { NextRequest, NextResponse } from 'next/server';
import { getAvailableStartTimes } from '@/lib/scheduling';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date     = searchParams.get('date');
    const duration = parseInt(searchParams.get('duration') ?? '60', 10);

    if (!date) return NextResponse.json({ error: 'date param required' }, { status: 400 });
    if (isNaN(duration) || duration < 1) return NextResponse.json({ error: 'invalid duration' }, { status: 400 });

    const slots = await getAvailableStartTimes(date, duration);
    return NextResponse.json({ slots });
  } catch (error) {
    console.error('GET /api/slots error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
