import { NextRequest, NextResponse } from 'next/server';
import { SignJWT, importPKCS8, decodeJwt } from 'jose';
import { prisma } from '@/lib/prisma';
import { signToken, SESSION_COOKIE, SESSION_MAX_AGE } from '@/lib/auth';

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
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  try {
    const formData = await request.formData();
    const code     = formData.get('code') as string | null;
    const idToken  = formData.get('id_token') as string | null;

    if (!code || !idToken) {
      return NextResponse.redirect(`${appUrl}/auth?error=apple_denied`);
    }

    // Decode id_token to get user sub and email (without full verification for simplicity)
    const payload = decodeJwt(idToken) as { sub: string; email?: string };
    const appleSub = payload.sub;
    const email    = payload.email;

    // Exchange code for tokens (to get name from first-time sign-in)
    const clientSecret = await getAppleClientSecret();
    const redirectUri  = `${appUrl}/api/auth/apple/callback`;

    const tokenRes = await fetch('https://appleid.apple.com/auth/token', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    new URLSearchParams({
        code,
        client_id:     process.env.APPLE_CLIENT_ID ?? '',
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
    response.cookies.set(SESSION_COOKIE, jwtToken, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   SESSION_MAX_AGE,
      path:     '/',
    });

    return response;
  } catch (err) {
    console.error('[Apple OAuth] Callback error:', err);
    return NextResponse.redirect(`${appUrl}/auth?error=apple_failed`);
  }
}
