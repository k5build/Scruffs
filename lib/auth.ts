import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET ?? 'scruffs-jwt-secret-dev-CHANGE-IN-PRODUCTION';
  if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    console.error('[SECURITY] JWT_SECRET is not set — using insecure default');
  }
  return new TextEncoder().encode(secret);
}

export const SESSION_COOKIE  = 'scruffs_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/** Shared secure cookie options — always secure, lax for OAuth compat */
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure:   true,           // always true — dev must use HTTPS or localhost (localhost is exempt)
  sameSite: 'lax' as const, // lax required for OAuth top-level redirects
  maxAge:   SESSION_MAX_AGE,
  path:     '/',
} as const;

/** Sign a JWT containing the userId with iss/aud/sub claims */
export async function signToken(userId: string): Promise<string> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .setIssuer(appUrl)
    .setAudience(appUrl)
    .setSubject(userId)
    .sign(getJwtSecret());
}

/** Verify a JWT and return payload, or null if invalid */
export async function verifyToken(token: string): Promise<{ userId: string } | null> {
  try {
    // Note: issuer/audience validation is intentionally lenient here to support
    // tokens signed before these claims were added. Tighten after all sessions expire.
    const { payload } = await jwtVerify(token, getJwtSecret());
    return { userId: payload.userId as string };
  } catch {
    return null;
  }
}

/** Get the logged-in user from the session cookie (Server Component / Route Handler) */
export async function getSessionUser() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return null;

    const payload = await verifyToken(token);
    if (!payload) return null;

    return prisma.user.findUnique({ where: { id: payload.userId } });
  } catch {
    return null;
  }
}

/** Normalize a phone number to E.164 format.
 *  UAE shortcuts: 05xxxxxxxx → +9715xxxxxxxx, 5xxxxxxxx → +9715xxxxxxxx
 *  Everything else: strip non-digits and prepend + (preserves country code) */
export function normalizePhone(raw: string): string {
  const trimmed = raw.trim();

  // If user typed a + prefix, treat digits after it as the full international number
  if (trimmed.startsWith('+')) {
    const digits = trimmed.slice(1).replace(/\D/g, '');
    return `+${digits}`;
  }

  const digits = trimmed.replace(/\D/g, '');

  // UAE local: 05xxxxxxxx (10 digits)
  if (digits.startsWith('05') && digits.length === 10) return `+971${digits.slice(1)}`;
  // UAE local: 5xxxxxxxx (9 digits)
  if (digits.startsWith('5') && digits.length === 9)   return `+971${digits}`;
  // Already has country code (no leading +): e.g. 971501234567, 447911123456
  if (digits.length >= 10) return `+${digits}`;

  // Fallback — assume UAE
  return `+971${digits}`;
}
