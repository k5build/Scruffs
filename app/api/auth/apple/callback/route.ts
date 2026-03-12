import { NextRequest, NextResponse } from 'next/server';
import { SignJWT, importPKCS8, jwtVerify, createRemoteJWKSet } from 'jose';
import { prisma } from '@/lib/prisma';
import { signToken, SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from '@/lib/auth';

// Apple's public keys for id_token signature verification
const APPLE_JWKS = createRemoteJWKSet(new URL('https://appleid.apple.com/auth/keys'));

async function getAppleClientSecret(): Promise<string> {
  const privateKey = process.env.APPLE_PRIVATE_KEY?.replace(/\\n/g, '\n') ?? '';
  const key = await importPKCS8(privateKey, 'ES256');
  return new SignJWT({})
    .setProtectedHeader({ alg: 'ES256', kid: process.env.APPLE_KEY_ID })
    .setIssuer(process.env.APPLE_TEAM_ID ?? '')
    .setIssuedAt()
    .setExpirationTime('5m')
    .setAudience('https://appleid.apple.com')
    .setSubject(process.env.APPLE_CLIENT_ID ?? '')
    .sign(key);
}

export async function POST(request: NextRequest) {
  const appUrl   = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const clientId = process.env.APPLE_CLIENT_ID;

  try {
    const formData = await request.formData();
    const code     = formData.get('code') as string | null;
    const idToken  = formData.get('id_token') as string | null;
    const stateParam = formData.get('state') as string | null;

    if (!code || !idToken) {
      return NextResponse.redirect(`${appUrl}/auth?error=apple_denied`);
    }

    // Validate OAuth state parameter to prevent CSRF / authorization code injection
    const storedState = request.cookies.get('apple_oauth_state')?.value;
    if (!stateParam || !storedState || stateParam !== storedState) {
      console.warn('[Apple OAuth] State mismatch — possible CSRF attempt');
      return NextResponse.redirect(`${appUrl}/auth?error=apple_failed`);
    }

    // Verify Apple id_token with Apple's public keys (JWKS)
    // This prevents account takeover via crafted id_tokens
    if (!clientId) {
      console.error('[Apple OAuth] APPLE_CLIENT_ID not configured');
      return NextResponse.redirect(`${appUrl}/auth?error=apple_failed`);
    }

    let appleSub: string;
    let email: string | undefined;

    try {
      const { payload } = await jwtVerify(idToken, APPLE_JWKS, {
        issuer:   'https://appleid.apple.com',
        audience: clientId,
      });
      appleSub = payload.sub as string;
      email    = payload.email as string | undefined;
    } catch (err) {
      console.error('[Apple OAuth] id_token verification failed:', err);
      return NextResponse.redirect(`${appUrl}/auth?error=apple_failed`);
    }

    // Exchange code for tokens (validates the authorization code itself)
    const clientSecret = await getAppleClientSecret();
    const redirectUri  = `${appUrl}/api/auth/apple/callback`;

    const tokenRes = await fetch('https://appleid.apple.com/auth/token', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    new URLSearchParams({
        code,
        client_id:     clientId,
        client_secret: clientSecret,
        redirect_uri:  redirectUri,
        grant_type:    'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      console.error('[Apple OAuth] Token exchange failed:', await tokenRes.text());
      return NextResponse.redirect(`${appUrl}/auth?error=apple_failed`);
    }

    // Get name from form data (only sent on first authorization)
    const userJson = formData.get('user') as string | null;
    let firstName = '';
    let lastName  = '';
    if (userJson) {
      try {
        const u = JSON.parse(userJson) as { name?: { firstName?: string; lastName?: string } };
        firstName = u.name?.firstName ?? '';
        lastName  = u.name?.lastName  ?? '';
      } catch { /* ignore */ }
    }
    const fullName = [firstName, lastName].filter(Boolean).join(' ');

    // Find or create user
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { appleId: appleSub },
          ...(email ? [{ email }] : []),
        ],
      },
    });

    if (user) {
      if (!user.appleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data:  { appleId: appleSub },
        });
      }
    } else {
      user = await prisma.user.create({
        data: {
          appleId: appleSub,
          email:   email ?? undefined,
          name:    fullName || undefined,
        },
      });
    }

    const jwtToken = await signToken(user.id);
    const response = NextResponse.redirect(`${appUrl}/`);
    response.cookies.set(SESSION_COOKIE, jwtToken, SESSION_COOKIE_OPTIONS);

    // Clear the state cookie
    response.cookies.delete('apple_oauth_state');

    return response;
  } catch (err) {
    console.error('[Apple OAuth] Callback error:', err);
    return NextResponse.redirect(`${appUrl}/auth?error=apple_failed`);
  }
}
