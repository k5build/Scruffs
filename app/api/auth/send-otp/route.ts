import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizePhone } from '@/lib/auth';

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(request: NextRequest) {
  try {
    const { phone: rawPhone } = await request.json();
    if (!rawPhone) return NextResponse.json({ error: 'Phone required' }, { status: 400 });

    const phone = normalizePhone(rawPhone);

    // Rate limit: max 3 OTPs per phone per 10 min
    const recent = await prisma.otpCode.count({
      where: {
        phone,
        createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) },
      },
    });
    if (recent >= 3) {
      return NextResponse.json({ error: 'Too many attempts. Wait 10 minutes.' }, { status: 429 });
    }

    // Ensure user exists (create if first time)
    await prisma.user.upsert({
      where:  { phone },
      update: {},
      create: { phone },
    });

    const code      = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Invalidate old codes for this phone
    await prisma.otpCode.updateMany({
      where: { phone, used: false },
      data:  { used: true },
    });

    await prisma.otpCode.create({ data: { phone, code, expiresAt } });

    // Send via Twilio Verify (if configured)
    const sid    = process.env.TWILIO_ACCOUNT_SID;
    const token  = process.env.TWILIO_AUTH_TOKEN;
    const verify = process.env.TWILIO_VERIFY_SID;

    let sent = false;

    if (sid && token && verify) {
      try {
        const twilio = (await import('twilio')).default;
        const client = twilio(sid, token);
        await client.verify.v2.services(verify).verifications.create({
          to:      phone,
          channel: 'sms',
        });
        sent = true;
      } catch (err) {
        console.error('[Scruffs] Twilio Verify error:', err);
        // fall through to dev mode
      }
    }

    if (!sent) {
      console.log(`\n[Scruffs] OTP for ${phone}: ${code}\n`);
    }

    return NextResponse.json({
      success: true,
      phone,
      // Return devOtp whenever SMS wasn't sent (Twilio not configured)
      // so the user can test the flow without real SMS setup
      ...(!sent ? { devOtp: code } : {}),
    });
  } catch (err) {
    console.error('POST /api/auth/send-otp:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
