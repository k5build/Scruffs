import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

export async function GET() {
  const clientId    = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`;

  if (!clientId) {
    return NextResponse.json({ error: 'Google OAuth not configured' }, { status: 500 });
  }

  // Generate a cryptographically random state parameter to prevent CSRF
  const state = randomBytes(32).toString('hex');

  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  redirectUri,
    response_type: 'code',
    scope:         'openid email profile',
    access_type:   'offline',
    prompt:        'select_account',
    state,
  });

  const response = NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );

  // Store state in a short-lived cookie for validation in the callback
  response.cookies.set('oauth_state', state, {
    httpOnly: true,
    secure:   true,
    sameSite: 'lax',   // lax: cookie sent when Google redirects back (top-level GET)
    maxAge:   600,     // 10 minutes
    path:     '/api/auth/google/callback',
  });

  return response;
}
