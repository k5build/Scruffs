import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { recalcTier, loyaltyProgress } from '@/lib/utils';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

// Apple WWDR G4 Intermediate Certificate (public — safe to hardcode)
const WWDR_CERT = `-----BEGIN CERTIFICATE-----
MIIEVTCCAz2gAwIBAgIUV7HdPNTm4x0ENsHICpESTOGmPZcwDQYJKoZIhvcNAQEL
BQAwYjELMAkGA1UEBhMCVVMxEzARBgNVBAoTCkFwcGxlIEluYy4xJjAkBgNVBAsT
HUFwcGxlIENlcnRpZmljYXRpb24gQXV0aG9yaXR5MRYwFAYDVQQDEw1BcHBsZSBS
b290IENBMB4XDTIxMDQyMDE5NDIwNloXDTM2MDQxOTE5NDIwNlowZTELMAkGA1UE
BhMCVVMxEzARBgNVBAoTCkFwcGxlIEluYy4xJjAkBgNVBAsTHUFwcGxlIENlcnRp
ZmljYXRpb24gQXV0aG9yaXR5MRkwFwYDVQQDExBBcHBsZSBXV0RSIENBIEc0MIIB
IjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2a7pBCfakRr40cHHtmVbgWga
oGQnRi7IQDHkNFMNHJ8kZN2pv4Hzr7AMG4fCf0bZfhNMm/yCZ3YqEEwApJmWRaU
sV5CLWBNV9CJ/yMU6CgMq3pJd5CiMD3TT+F7fqONxbClBwmLCKcI3XDm5h6jFoO
zPr7uH+K7rZHj8GnOi+DWfJfaeFrJoibCh0e3THKP5bhqTKRJIJAilJLV4EvFoW
RijYYoSqPNHNkQM21U6iN23lWW4+I9TAtH+wUUl8ixUPKH6RoePDEHf9l3G7JXTH
nxBcCKzKVXdBlxqEDl8naTKbY1L9BdNZH97f3LGZ3VfWPRyL/DxeqZGJDhNrNwID
AQABo4HpMIHmMA8GA1UdEwEB/wQFMAMBAf8wHQYDVR0OBBYEFAe3fzTQTkHlMWUc
HL4YBPn69mgLMB8GA1UdIwQYMBaAFCvQaUeUdgn+9GuNLkCm90dNfwheMEQGCCsG
AQUFBwEBBDgwNjA0BggrBgEFBQcwAYYoaHR0cDovL29jc3AuYXBwbGUuY29tL29j
c3AwMy93d2RyZzQwMDAGA1UdHwQpMCcwJaAjoCGGH2h0dHA6Ly9jcmwuYXBwbGUu
Y29tL3d3ZHJnNC5jcmwwDgYDVR0PAQH/BAQDAgGGMBAGCiqGSIb3Y2QGCwEEAgUA
MA0GCSqGSIb3DQEBCwUAA4IBAQB/GQHm9mBEH0IYjDfnJpfzGt2Rl+xCxbVDtZ7x
P+CKNYW+Gj4T/ry+xOPb/JmW0cKH7b1HBTMHFa1l5GhzCLYMLlPnkFt0TWQJV6W
dInZSqkEmpTFPiMCrWf8fFIEJJp5VsqJMM3o8LF2JgixjXZLh+FWLXcBWq5Oc6VL
pYTqWCJIhTxIkTYNNSAdBZISEyXd8QoB/i/5qNvEfPSfWQILRVzBF+/j4QCfbMFl
Y3NpYFtS/ksMJ0tSKuYxVgz6O7/UT/y6rAdB4HhLnHxAbSzSR1c/lfDGt/8MqMaT
0TvFPKSTtU7J7z+XpEFIQM5CDQ8pWXm6FqL1b3FHkjb5
-----END CERTIFICATE-----`;

export async function GET(request: NextRequest) {
  // Auth check — must be logged in
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check Apple Wallet credentials
  const signerCert = process.env.APPLE_PASS_CERT_PEM;
  const signerKey  = process.env.APPLE_PASS_KEY_PEM;
  const passTypeId = process.env.APPLE_PASS_TYPE_ID;   // e.g. pass.ae.scruffs.loyalty
  const teamId     = process.env.APPLE_TEAM_ID;         // 10-char team ID

  if (!signerCert || !signerKey || !passTypeId || !teamId) {
    return NextResponse.json(
      { error: 'Apple Wallet not configured', setup: true },
      { status: 501 }
    );
  }

  try {
    const { PKPass } = await import('passkit-generator');

    // Read logo from public folder
    const logoPath   = path.join(process.cwd(), 'public', 'logo-icon-beige.png');
    const logoBuffer = fs.readFileSync(logoPath);
    const tier       = recalcTier(user.loyaltyPoints ?? 0);
    const { pointsToNext, nextTier } = loyaltyProgress(user.loyaltyPoints ?? 0);

    const passJson = JSON.stringify({
      formatVersion:      1,
      passTypeIdentifier: passTypeId,
      serialNumber:       `SCR-${user.id.slice(-8).toUpperCase()}`,
      teamIdentifier:     teamId,
      organizationName:   'Scruffs.ae',
      description:        'Scruffs Loyalty Card',
      logoText:           'SCRUFFS',
      foregroundColor:    'rgb(219, 212, 199)',
      backgroundColor:    'rgb(58, 79, 74)',
      labelColor:         'rgb(163, 192, 190)',
      storeCard: {
        primaryFields: [
          {
            key:           'points',
            label:         'LOYALTY POINTS',
            value:         (user.loyaltyPoints ?? 0).toLocaleString(),
            textAlignment: 'PKTextAlignmentCenter',
          },
        ],
        secondaryFields: [
          { key: 'tier',   label: 'TIER',   value: tier },
          { key: 'member', label: 'MEMBER', value: user.name ?? user.phone ?? 'Member' },
        ],
        auxiliaryFields: [
          {
            key:   'progress',
            label: 'TO NEXT TIER',
            value: nextTier ? `${pointsToNext} pts to ${nextTier}` : 'Max tier reached',
          },
        ],
        backFields: [
          { key: 'cardId',   label: 'CARD ID',       value: `SCR-${user.id.slice(-8).toUpperCase()}` },
          {
            key:   'benefit',
            label: 'YOUR BENEFIT',
            value: tier === 'GOLD'   ? '10% off every booking + priority slots' :
                   tier === 'SILVER' ? '5% off every booking' :
                   'Earn 1 pt per AED spent',
          },
          { key: 'howToEarn', label: 'HOW TO EARN', value: 'Book a grooming session to earn 1 pt per AED spent' },
          {
            key:             'website',
            label:           'BOOK NOW',
            value:           'scruffs.ae',
            attributedValue: '<a href="https://scruffs.vercel.app/book">Book a Session</a>',
          },
        ],
      },
      barcodes: [
        {
          message:         `SCRUFFS-${user.id}`,
          format:          'PKBarcodeFormatQR',
          messageEncoding: 'iso-8859-1',
          altText:         `SCR-${user.id.slice(-8).toUpperCase()}`,
        },
      ],
    });

    // Use the PKPass constructor with FileBuffers (no temp dir needed)
    const pass = new PKPass(
      {
        'pass.json':   Buffer.from(passJson),
        'icon.png':    logoBuffer,
        'icon@2x.png': logoBuffer,
        'logo.png':    logoBuffer,
        'logo@2x.png': logoBuffer,
      },
      {
        wwdr:       WWDR_CERT,
        signerCert: signerCert,
        signerKey:  signerKey,
      },
    );

    const buffer = pass.getAsBuffer();

    // Use Uint8Array so TypeScript's Response BodyInit accepts it
    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type':        'application/vnd.apple.pkpass',
        'Content-Disposition': 'attachment; filename="scruffs-loyalty.pkpass"',
        'Content-Length':      String(buffer.length),
      },
    });
  } catch (err) {
    console.error('[Scruffs] Apple Wallet pass error:', err);
    return NextResponse.json(
      { error: 'Failed to generate pass. Check server logs.' },
      { status: 500 }
    );
  }
}
