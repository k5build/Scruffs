import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { signAdminToken, ADMIN_COOKIE_NAME, ADMIN_COOKIE_MAX_AGE } from '@/lib/adminAuth';

// In-memory rate limiter for admin login (per IP, 5 attempts per 15 min)
// Note: resets on serverless cold start — sufficient for a single-admin app
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now       = Date.now();
  const windowMs  = 15 * 60 * 1000;
  const maxTries  = 5;
  const record    = loginAttempts.get(ip);

  if (!record || record.resetAt <= now) {
    loginAttempts.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }
  if (record.count >= maxTries) {
    return { allowed: false, retryAfter: Math.ceil((record.resetAt - now) / 1000) };
  }
  record.count++;
  return { allowed: true };
}

/** Timing-safe string comparison — prevents timing attacks on password check */
function safeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, 'utf8');
    const bufB = Buffer.from(b, 'utf8');
    // Must be same length; perform dummy compare to keep constant time
    if (bufA.length !== bufB.length) {
      timingSafeEqual(bufA, bufA);
      return false;
    }
    return timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  // Get client IP for rate limiting
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? 'unknown';

  const { allowed, retryAfter } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many login attempts. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    );
  }

  try {
    const { password } = await request.json();
    const ADMIN_PW = process.env.ADMIN_PASSWORD ?? 'scruffs2024';

    if (!safeCompare(password ?? '', ADMIN_PW)) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    // Issue a signed JWT as the admin session cookie
    const adminToken = await signAdminToken();
    const response   = NextResponse.json({ success: true });

    response.cookies.set(ADMIN_COOKIE_NAME, adminToken, {
      httpOnly: true,
      secure:   true,
      sameSite: 'strict',
      maxAge:   ADMIN_COOKIE_MAX_AGE,
      path:     '/',
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(ADMIN_COOKIE_NAME);
  return response;
}
