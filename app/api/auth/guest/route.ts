import { NextResponse } from 'next/server';

export async function GET() {
  const appUrl   = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const response = NextResponse.redirect(`${appUrl}/`);
  // Guest cookie lasts 24 hours — skips auth gate on home page
  response.cookies.set('scruffs_guest', '1', {
    httpOnly: false,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   60 * 60 * 24,
    path:     '/',
  });
  return response;
}
