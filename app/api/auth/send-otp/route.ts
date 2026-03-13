import { NextRequest, NextResponse } from 'next/server';
import { randomInt } from 'crypto';
import { prisma } from '@/lib/prisma';
import { normalizePhone } from '@/lib/auth';
import { encryptField, hashField } from '@/lib/crypto';
import { logger } from '@/lib/logger';

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
    logger.error('send-otp', `Twilio Verify (${channel}) error`, {
      error: err instanceof Error ? err.message : String(err),
    });
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
    logger.error('send-otp', 'Twilio WhatsApp Messages error', {
      error: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}

// ── Meta WhatsApp Cloud API ────────────────────────────────────────────────────
// Template setup (create in Meta Business Suite → WhatsApp → Message Templates):
//
//   Category:  AUTHENTICATION  (or UTILITY)
//   Name:      set via WHATSAPP_TEMPLATE_NAME env var (default: scruffs_otp)
//   Language:  English (en_US)
//   Body:      "{{1}} is your Scruffs verification code. Valid for 10 minutes."
//   Button:    COPY CODE  (optional — set WHATSAPP_TEMPLATE_COPY_BUTTON=true)
//
async function sendViaMetaWhatsApp(phone: string, code: string): Promise<boolean> {
  const waToken    = process.env.WHATSAPP_TOKEN;
  const waPhoneId  = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME ?? 'scruffs_otp';
  const hasCopyBtn   = process.env.WHATSAPP_TEMPLATE_COPY_BUTTON === 'true';

  if (!waToken || !waPhoneId) return false;

  // WhatsApp API requires numbers without leading +
  const to = phone.startsWith('+') ? phone.slice(1) : phone;

  // Build template components
  // Body always includes the code as parameter {{1}}
  const components: object[] = [
    {
      type:       'body',
      parameters: [{ type: 'text', text: code }],
    },
  ];

  // If the template has a COPY CODE button, include the button component
  if (hasCopyBtn) {
    components.push({
      type:       'button',
      sub_type:   'COPY_CODE',
      index:      '0',
      parameters: [{ type: 'COUPON_CODE', coupon_code: code }],
    });
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${waPhoneId}/messages`,
      {
        method:  'POST',
        headers: {
          Authorization:  `Bearer ${waToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to,
          type:     'template',
          template: {
            name:       templateName,
            language:   { code: 'en_US' },
            components,
          },
        }),
      }
    );

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({})) as Record<string, unknown>;
      logger.error('send-otp', 'Meta WhatsApp API error', {
        error: JSON.stringify(errBody).slice(0, 200),
      });
      return false;
    }
    return true;
  } catch (err) {
    logger.error('send-otp', 'Meta WhatsApp error', {
      error: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { phone: rawPhone } = await request.json();
    if (!rawPhone) return NextResponse.json({ error: 'Phone required' }, { status: 400 });

    const phone     = normalizePhone(rawPhone);
    const phoneHash = hashField(phone);

    // Rate limit: max 3 OTPs per phone per 10 min — use phoneHash for indexed lookup
    const recent = await prisma.otpCode.count({
      where: { phoneHash, createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) } },
    });
    if (recent >= 3) {
      logger.warn('send-otp', 'OTP rate limit hit', { phone, action: 'otp.rate_limited' });
      return NextResponse.json({ error: 'Too many attempts. Wait 10 minutes.' }, { status: 429 });
    }

    // Ensure user exists — store encrypted phone and hash
    const encryptedPhone = encryptField(phone);
    await prisma.user.upsert({
      where:  { phone },
      update: { phoneHash },
      create: { phone: encryptedPhone, phoneHash },
    });

    const code      = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Invalidate old codes and store new one (used as fallback when Twilio Verify isn't available)
    await prisma.otpCode.updateMany({ where: { phone, used: false }, data: { used: true } });
    await prisma.otpCode.create({ data: { phone, phoneHash, code, expiresAt } });

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
      // Dev fallback — log code (masked in prod) and return in response
      logger.info('send-otp', 'OTP dev fallback — no provider configured', { phone, channel: 'dev' });
      sentVia = 'dev';
    } else {
      logger.info('send-otp', 'OTP sent', { phone, channel: sentVia, action: 'otp.sent' });
    }

    return NextResponse.json({
      success: true,
      phone,
      channel: sentVia,
      ...(sentVia === 'dev' ? { devOtp: code } : {}),
    });
  } catch (err) {
    logger.error('send-otp', 'POST /api/auth/send-otp error', {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
