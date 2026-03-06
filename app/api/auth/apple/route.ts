import { NextResponse } from 'next/server';

export async function GET() {
  const clientId    = process.env.APPLE_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/apple/callback`;

  if (!clientId) {
    return NextResponse.json({ error: 'Apple OAuth not configured' }, { status: 500 });
  }

  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  redirectUri,
    response_type: 'code id_token',
    response_mode: 'form_post',
    scope:         'name email',
  });

  return NextResponse.redirect(
    `https://appleid.apple.com/auth/authorize?${params.toString()}`
  );
}
