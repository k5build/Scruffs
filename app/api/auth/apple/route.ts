import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

export async function GET() {
  const clientId    = process.env.APPLE_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/apple/callback`;

  if (!clientId) {
    return NextResponse.json({ error: 'Apple OAuth not configured' }, { status: 500 });
  }

  // Generate a cryptographically random state parameter to prevent CSRF
  const state = randomBytes(32).toString('hex');

  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  redirectUri,
    response_type: 'code id_token',
    response_mode: 'form_post',
    scope:         'name email',
    state,
  });

  const response = NextResponse.redirect(
    `https://appleid.apple.com/auth/authorize?${params.toString()}`
  );

  // Apple returns via POST, so sameSite must be 'none' for the state cookie
  // to be included in the cross-site POST callback
  response.cookies.set('apple_oauth_state', state, {
    httpOnly: true,
    secure:   true,
    sameSite: 'none',  // required: Apple callback is a cross-site POST
    maxAge:   600,     // 10 minutes
    path:     '/api/auth/apple/callback',
  });

  return response;
}
