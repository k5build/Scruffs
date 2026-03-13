import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { signAdminToken, ADMIN_COOKIE_NAME, ADMIN_COOKIE_MAX_AGE } from '@/lib/adminAuth';
import { verifyTotp } from '@/lib/totp';
import { logger } from '@/lib/logger';
import { audit } from '@/lib/audit';
import { checkRateLimit } from '@/lib/rateLimit';

const SERVICE = 'admin-auth';

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

function getIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  );
}

export async function POST(request: NextRequest) {
  const ip        = getIp(request);
  const userAgent = request.headers.get('user-agent') ?? undefined;

  // Rate limit: 5 attempts per 15 minutes per IP
  const { allowed, retryAfter } = checkRateLimit(`${ip}:admin-login`, 5, 15 * 60 * 1000);
  if (!allowed) {
    logger.warn(SERVICE, 'Rate limit hit on admin login', { ip, action: 'admin.login.rate_limited' });
    await audit({ action: 'admin.login.rate_limited', actor: 'unknown', ip, userAgent });
    return NextResponse.json(
      { error: 'Too many login attempts. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    );
  }

  try {
    const body = await request.json() as { password?: string; totp?: string };
    const { password, totp } = body;

    const ADMIN_PW      = process.env.ADMIN_PASSWORD ?? 'scruffs2024';
    const TOTP_SECRET   = process.env.ADMIN_TOTP_SECRET;
    const totpEnabled   = Boolean(TOTP_SECRET);

    if (!safeCompare(password ?? '', ADMIN_PW)) {
      logger.warn(SERVICE, 'Admin login failed — wrong password', { ip, action: 'admin.login.failed' });
      await audit({ action: 'admin.login.failed', actor: 'unknown', ip, userAgent, details: { reason: 'wrong_password' } });
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    // Password is correct — check if TOTP is enabled
    if (totpEnabled) {
      if (!TOTP_SECRET) {
        // Should never reach here due to totpEnabled check, but satisfies TS
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
      }

      // Step 1: password-only → prompt for TOTP
      if (!totp) {
        logger.info(SERVICE, 'Admin password correct — requesting TOTP', { ip, action: 'admin.login.totp_required' });
        return NextResponse.json({ requireTotp: true });
      }

      // Step 2: verify TOTP
      const totpValid = verifyTotp(TOTP_SECRET, String(totp));
      if (!totpValid) {
        logger.warn(SERVICE, 'Admin login failed — wrong TOTP', { ip, action: 'admin.login.totp_failed' });
        await audit({ action: 'admin.login.totp_failed', actor: 'admin', ip, userAgent, details: { reason: 'wrong_totp' } });
        return NextResponse.json({ error: 'Invalid authenticator code' }, { status: 401 });
      }
    } else {
      // TOTP not configured — warn and proceed with password only
      logger.warn(SERVICE, 'ADMIN_TOTP_SECRET not set — issuing token without 2FA (set it to enable TOTP)', { ip });
    }

    // Issue signed JWT as admin session cookie
    const adminToken = await signAdminToken();
    const response   = NextResponse.json({ success: true });

    response.cookies.set(ADMIN_COOKIE_NAME, adminToken, {
      httpOnly: true,
      secure:   true,
      sameSite: 'strict',
      maxAge:   ADMIN_COOKIE_MAX_AGE,
      path:     '/',
    });

    logger.info(SERVICE, 'Admin login successful', { ip, action: 'admin.login.success' });
    await audit({ action: 'admin.login', actor: 'admin', ip, userAgent, details: { totpUsed: totpEnabled } });

    return response;
  } catch (err) {
    logger.error(SERVICE, 'Admin auth route error', {
      ip,
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(ADMIN_COOKIE_NAME);
  return response;
}
