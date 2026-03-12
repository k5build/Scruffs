import { NextRequest, NextResponse } from 'next/server';
import { randomInt } from 'crypto';
import { prisma } from '@/lib/prisma';
import { normalizePhone } from '@/lib/auth';

function generateOtp(): string {
  // crypto.randomInt is cryptographically secure — Math.random() is NOT
  return String(randomInt(100000, 1000000)).padStart(6, '0');
}

// ── Twilio Verify (SMS) ────────────────────────────────────────────────────────
async function sendViaTwilioVerify(phone: string, channel: 'sms' | 'whatsapp'): Promise<boolean> {
  const sid    = process.env.TWILIO_ACCOUNT_SID;
  const token  = process.env.TWILIO_AUTH_TOKEN;
  const verify = process.env.TWILIO_VERIFY_SID;
  if (!sid || !token || !verify) return false;

  try {
    const twilio = (await import('twilio')).default;
    const client = twilio(sid, token);
    await client.verify.v2.services(verify).verifications.create({ to: phone, channel });
    return true;
  } catch (err) {
    console.error(`[Scruffs] Twilio Verify (${channel}) error:`, err);
    return false;
  }
}

// ── Twilio WhatsApp Messages API (fallback when Verify not configured) ─────────
async function sendViaTwilioWhatsAppMessages(phone: string, code: string): Promise<boolean> {
  const sid    = process.env.TWILIO_ACCOUNT_SID;
  const token  = process.env.TWILIO_AUTH_TOKEN;
  const waFrom = process.env.TWILIO_WHATSAPP_FROM; // e.g. whatsapp:+14155238886
  if (!sid || !token || !waFrom) return false;

  try {
    const twilio = (await import('twilio')).default;
    const client = twilio(sid, token);
    await client.messages.create({
      from: waFrom,
      to:   `whatsapp:${phone}`,
      body: `Your Scruffs verification code is: *${code}*\n\nValid for 10 minutes. Do not share this code.\n\n_Scruffs – Mobile Pet Grooming Dubai_`,
    });
    return true;
  } catch (err) {
    console.error('[Scruffs] Twilio WhatsApp Messages error:', err);
    return false;
  }
}

// ── Meta WhatsApp Cloud API ────────────────────────────────────────────────────
async function sendViaMetaWhatsApp(phone: string, code: string): Promise<boolean> {
  const waToken   = process.env.WHATSAPP_TOKEN;
  const waPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!waToken || !waPhoneId) return false;

  // Strip leading + for WhatsApp API
  const to = phone.startsWith('+') ? phone.slice(1) : phone;

  try {
    const res = await fetch(
      `https://graph.facebook.com/v18.0/${waPhoneId}/messages`,
      {
        method:  'POST',
        headers: {
          Authorization:  `Bearer ${waToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to,
          type: 'template',
          template: {
            name:     'scruffs_otp',
            language: { code: 'en_US' },
            components: [{
              type:       'body',
              parameters: [{ type: 'text', text: code }],
            }],
          },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('[Scruffs] Meta WhatsApp error:', err);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Scruffs] Meta WhatsApp error:', err);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { phone: rawPhone } = await request.json();
    if (!rawPhone) return NextResponse.json({ error: 'Phone required' }, { status: 400 });

    const phone = normalizePhone(rawPhone);

    // Rate limit: max 3 OTPs per phone per 10 min
    const recent = await prisma.otpCode.count({
      where: { phone, createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) } },
    });
    if (recent >= 3) {
      return NextResponse.json({ error: 'Too many attempts. Wait 10 minutes.' }, { status: 429 });
    }

    // Ensure user exists
    await prisma.user.upsert({ where: { phone }, update: {}, create: { phone } });

    const code      = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Invalidate old codes and store new one (used as fallback when Twilio Verify isn't available)
    await prisma.otpCode.updateMany({ where: { phone, used: false }, data: { used: true } });
    await prisma.otpCode.create({ data: { phone, code, expiresAt } });

    // OTP_CHANNEL controls delivery:
    //   'sms'       – Twilio Verify SMS (default)
    //   'whatsapp'  – Twilio Verify WhatsApp (preferred) → falls back to Messages API
    //   'meta'      – Meta WhatsApp Cloud API
    //   'both'      – Twilio Verify SMS + WhatsApp
    const channel = (process.env.OTP_CHANNEL ?? 'sms').toLowerCase();

    let sent    = false;
    let sentVia = channel; // track which provider actually delivered

    if (channel === 'sms') {
      sent = await sendViaTwilioVerify(phone, 'sms');
      sentVia = 'sms';
    }

    if (channel === 'whatsapp') {
      // Prefer Twilio Verify WhatsApp — no template approval needed
      sent = await sendViaTwilioVerify(phone, 'whatsapp');
      sentVia = 'whatsapp';

      if (!sent) {
        // Fallback: Twilio Messages API (needs TWILIO_WHATSAPP_FROM configured)
        sent = await sendViaTwilioWhatsAppMessages(phone, code);
        sentVia = 'whatsapp_messages';
      }
    }

    if (channel === 'meta') {
      sent = await sendViaMetaWhatsApp(phone, code);
      sentVia = 'meta';
    }

    if (channel === 'both') {
      const smsSent = await sendViaTwilioVerify(phone, 'sms');
      const waSent  = await sendViaTwilioVerify(phone, 'whatsapp');
      sent    = smsSent || waSent;
      sentVia = 'both';
    }

    if (!sent) {
      // Dev fallback — log code to console and return in response
      console.log(`\n[Scruffs] OTP for ${phone}: ${code}\n`);
      sentVia = 'dev';
    }

    return NextResponse.json({
      success: true,
      phone,
      channel: sentVia,
      ...(sentVia === 'dev' ? { devOtp: code } : {}),
    });
  } catch (err) {
    console.error('POST /api/auth/send-otp:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
