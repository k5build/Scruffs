import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken, normalizePhone, SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from '@/lib/auth';
import { hashField } from '@/lib/crypto';
import { logger } from '@/lib/logger';

/** Use Twilio Verify check for SMS and WhatsApp Verify channels */
async function checkViaTwilioVerify(phone: string, code: string): Promise<boolean> {
  const sid    = process.env.TWILIO_ACCOUNT_SID;
  const token  = process.env.TWILIO_AUTH_TOKEN;
  const verify = process.env.TWILIO_VERIFY_SID;
  if (!sid || !token || !verify || sid.startsWith('ACxxx')) return false;

  try {
    const twilio = (await import('twilio')).default;
    const client = twilio(sid, token);
    const check  = await client.verify.v2.services(verify).verificationChecks.create({
      to:   phone,
      code: code.trim(),
    });
    return check.status === 'approved';
  } catch (err) {
    logger.error('verify-otp', 'Twilio Verify check error', {
      error: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { phone: rawPhone, code } = await request.json();
    if (!rawPhone || !code) {
      return NextResponse.json({ error: 'Phone and code required' }, { status: 400 });
    }

    const phone     = normalizePhone(rawPhone);
    const phoneHash = hashField(phone);
    let verified    = false;

    // OTP_CHANNEL controls which provider was used to SEND the code.
    const channel = (process.env.OTP_CHANNEL ?? 'sms').toLowerCase();

    // Twilio Verify handles both SMS and WhatsApp Verify channels
    if (channel === 'sms' || channel === 'whatsapp' || channel === 'both') {
      verified = await checkViaTwilioVerify(phone, code);
    }

    // DB-stored OTP check — fallback for: meta, whatsapp_messages fallback, dev mode
    // Use phoneHash for indexed lookup
    if (!verified) {
      const otp = await prisma.otpCode.findFirst({
        where: { phoneHash, used: false, code: code.trim() },
        orderBy: { createdAt: 'desc' },
      });

      if (!otp) {
        return NextResponse.json({ error: 'Invalid code' }, { status: 401 });
      }

      if (new Date(otp.expiresAt) < new Date()) {
        return NextResponse.json({ error: 'Code expired. Request a new one.' }, { status: 401 });
      }

      if (otp.attempts >= 5) {
        return NextResponse.json({ error: 'Too many attempts. Request a new code.' }, { status: 429 });
      }

      // Increment attempt counter before verifying (prevents brute force)
      await prisma.otpCode.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
      await prisma.otpCode.update({ where: { id: otp.id }, data: { used: true } });
      verified = true;
    }

    if (!verified) {
      return NextResponse.json({ error: 'Invalid code' }, { status: 401 });
    }

    // Get or create user — include phoneHash
    const user = await prisma.user.upsert({
      where:  { phone },
      update: { phoneHash },
      create: { phone, phoneHash, name: null, email: null },
    });

    // Sign JWT session
    const jwtToken = await signToken(user.id);
    const response = NextResponse.json({
      success: true,
      user: { id: user.id, phone: user.phone, name: user.name, email: user.email },
    });
    response.cookies.set(SESSION_COOKIE, jwtToken, SESSION_COOKIE_OPTIONS);

    return response;
  } catch (err) {
    logger.error('verify-otp', 'POST /api/auth/verify-otp error', {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
