import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { recalcTier, loyaltyProgress } from '@/lib/utils';
import { SignJWT, importPKCS8 } from 'jose';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const issuerId      = process.env.GOOGLE_WALLET_ISSUER_ID;
  const serviceEmail  = process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL;
  const privateKeyPem = process.env.GOOGLE_WALLET_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!issuerId || !serviceEmail || !privateKeyPem) {
    return NextResponse.json(
      { error: 'Google Wallet not configured', setup: true },
      { status: 501 }
    );
  }

  try {
    const tier          = recalcTier(user.loyaltyPoints ?? 0);
    const { pointsToNext, nextTier } = loyaltyProgress(user.loyaltyPoints ?? 0);
    const classId  = `${issuerId}.scruffs_loyalty_class`;
    const objectId = `${issuerId}.scruffs_user_${user.id}`;

    const tierHex: Record<string, string> = {
      BRONZE: '#8B5E3C',
      SILVER: '#9E9E9E',
      GOLD:   '#B8860B',
    };

    const passObject = {
      id:    objectId,
      classId,
      state: 'ACTIVE',
      cardTitle: {
        defaultValue: { language: 'en-US', value: 'SCRUFFS' },
      },
      subheader: {
        defaultValue: { language: 'en-US', value: 'Loyalty Card' },
      },
      header: {
        defaultValue: { language: 'en-US', value: `${(user.loyaltyPoints ?? 0).toLocaleString()} pts` },
      },
      textModulesData: [
        {
          id:     'tier',
          header: 'TIER',
          body:   tier,
        },
        {
          id:     'member',
          header: 'MEMBER',
          body:   user.name ?? user.phone ?? 'Member',
        },
        {
          id:     'progress',
          header: 'TO NEXT TIER',
          body:   nextTier ? `${pointsToNext} pts to ${nextTier}` : 'Max tier reached',
        },
      ],
      barcode: {
        type:          'QR_CODE',
        value:         `SCRUFFS-${user.id}`,
        alternateText: `SCR-${user.id.slice(-8).toUpperCase()}`,
      },
      hexBackgroundColor: '#3A4F4A',
      logo: {
        sourceUri: {
          uri: 'https://scruffs.vercel.app/logo-icon-beige.png',
        },
      },
      heroImage: {
        sourceUri: {
          uri: 'https://scruffs.vercel.app/logo-dark.png',
        },
      },
    };

    // Build the JWT payload for Google Wallet
    const payload = {
      iss: serviceEmail,
      aud: 'google',
      typ: 'savetowallet',
      iat: Math.floor(Date.now() / 1000),
      origins: ['https://scruffs.vercel.app'],
      payload: {
        genericObjects: [passObject],
      },
    };

    const privateKey = await importPKCS8(privateKeyPem, 'RS256');
    const token = await new SignJWT(payload as Record<string, unknown>)
      .setProtectedHeader({ alg: 'RS256' })
      .sign(privateKey);

    const saveUrl = `https://pay.google.com/gp/v/save/${token}`;
    return NextResponse.redirect(saveUrl);
  } catch (err) {
    console.error('[Scruffs] Google Wallet error:', err);
    return NextResponse.json(
      { error: 'Failed to generate Google Wallet pass' },
      { status: 500 }
    );
  }
}
