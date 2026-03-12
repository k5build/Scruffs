import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken, normalizePhone, SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { phone: rawPhone, code } = await request.json();
    if (!rawPhone || !code) {
      return NextResponse.json({ error: 'Phone and code required' }, { status: 400 });
    }

    const phone = normalizePhone(rawPhone);
    let verified = false;

    // OTP_CHANNEL controls which provider was used to SEND the code.
    // Only use Twilio Verify check when channel is 'sms' — otherwise always use DB.
    const channel = (process.env.OTP_CHANNEL ?? 'sms').toLowerCase();

    if (channel === 'sms') {
      const sid    = process.env.TWILIO_ACCOUNT_SID;
      const token  = process.env.TWILIO_AUTH_TOKEN;
      const verify = process.env.TWILIO_VERIFY_SID;

      if (sid && token && verify && !sid.startsWith('ACxxx')) {
        try {
          const twilio = (await import('twilio')).default;
          const client = twilio(sid, token);
          const check  = await client.verify.v2.services(verify).verificationChecks.create({
            to:   phone,
            code: code.trim(),
          });
          verified = check.status === 'approved';
        } catch (err) {
          console.error('[Scruffs] Twilio Verify check error:', err);
          // fall through to DB check
        }
      }
    }

    // DB-stored OTP check — used for: meta, whatsapp, both, dev fallback
    if (!verified) {
      const otp = await prisma.otpCode.findFirst({
        where: { phone, used: false, code: code.trim() },
        orderBy: { createdAt: 'desc' },
      });

      if (!otp) {
        return NextResponse.json({ error: 'Invalid code' }, { status: 401 });
      }

      // Check expiry
      if (new Date(otp.expiresAt) < new Date()) {
        return NextResponse.json({ error: 'Code expired. Request a new one.' }, { status: 401 });
      }

      // Check attempts
      if (otp.attempts >= 5) {
        return NextResponse.json({ error: 'Too many attempts. Request a new code.' }, { status: 429 });
      }

      // Increment attempt counter before verifying (prevents brute force)
      await prisma.otpCode.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });

      // Mark used
      await prisma.otpCode.update({ where: { id: otp.id }, data: { used: true } });
      verified = true;
    }

    if (!verified) {
      return NextResponse.json({ error: 'Invalid code' }, { status: 401 });
    }

    // Get or create user
    const user = await prisma.user.upsert({
      where:  { phone },
      update: { updatedAt: new Date() },
      create: { phone, name: null, email: null },
    });

    // Sign JWT
    const jwtToken = await signToken(user.id);

    const response = NextResponse.json({ success: true, user: { id: user.id, phone: user.phone, name: user.name, email: user.email } });
    response.cookies.set(SESSION_COOKIE, jwtToken, SESSION_COOKIE_OPTIONS);

    return response;
  } catch (err) {
    console.error('POST /api/auth/verify-otp:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
