/**
 * Admin authentication helpers.
 * This file is Edge-runtime compatible (used by middleware).
 */
import { SignJWT, jwtVerify } from 'jose';
import { NextRequest } from 'next/server';

function getAdminKey(): Uint8Array {
  const secret = process.env.ADMIN_SECRET ?? 'scruffs2024-change-in-production';
  return new TextEncoder().encode(secret);
}

export const ADMIN_COOKIE_NAME    = 'admin_auth';
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/** Sign a JWT to use as the admin session cookie */
export async function signAdminToken(): Promise<string> {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getAdminKey());
}

/** Verify the admin JWT cookie. Returns true if valid. */
export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getAdminKey());
    return true;
  } catch {
    return false;
  }
}

/** Check if a request is authenticated as admin — works in Edge + Node runtimes */
export async function isAdminRequest(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return false;
  return verifyAdminToken(token);
}
