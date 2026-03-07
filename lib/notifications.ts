import { BASE_SERVICE, ADDONS, formatDate, formatTime, formatDuration, formatPrice } from './utils';

/* ── Types ─────────────────────────────────────────────────── */
interface BookingDetails {
  bookingRef:    string;
  petName:       string;
  petBreed:      string;
  petType:       string;
  petSize?:      string | null;
  service:       string;
  addons?:       string | null; // JSON string
  price:         number;
  duration:      number;
  slotDate:      string;
  slotStartTime: string;
  area:          string;
  address:       string;
  buildingNote?: string | null;
  mapsLink?:     string | null;
  ownerName:     string;
  ownerPhone:    string;
  ownerEmail?:   string | null;
}

/* ── Helpers ────────────────────────────────────────────────── */
function svcName(_key: string) {
  return BASE_SERVICE.name;
}

function addonsLabel(addonsJson: string | null | undefined): string {
  try {
    const keys: string[] = JSON.parse(addonsJson ?? '[]');
    if (!keys.length) return '';
    return keys.map((k) => ADDONS.find((a) => a.key === k)?.label ?? k).join(', ');
  } catch { return ''; }
}

function addMins(time: string, mins: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + mins;
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

/* ── Customer email HTML ─────────────────────────────────────── */
function customerEmailHtml(b: BookingDetails): string {
  const estimatedEnd = addMins(b.slotStartTime, b.duration);
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Booking Confirmed – Scruffs</title></head>
<body style="margin:0;padding:0;background:#F4F2EE;font-family:Arial,Helvetica,sans-serif;color:#2B3A36;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 16px;">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(58,79,74,0.10);">
<tr><td style="background:#3A4F4A;padding:36px 40px;text-align:center;">
  <p style="color:#A3C0BE;font-size:11px;font-weight:700;letter-spacing:0.2em;margin:0 0 8px;text-transform:uppercase;">Mobile Pet Grooming · Dubai</p>
  <h1 style="color:#DBD4C7;font-size:32px;margin:0;letter-spacing:0.22em;font-weight:900;">SCRUFFS</h1>
</td></tr>
<tr><td style="padding:36px 40px 24px;text-align:center;">
  <h2 style="font-size:24px;margin:0 0 8px;color:#2B3A36;">Booking Confirmed!</h2>
  <p style="color:#7A8582;font-size:15px;margin:0;">${b.petName} is in for a treat. See you on ${formatDate(b.slotDate)}!</p>
</td></tr>
<tr><td style="padding:0 40px 24px;">
  <div style="background:#F4F2EE;border-radius:12px;padding:20px;text-align:center;">
    <p style="color:#7A8582;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 8px;">Booking Reference</p>
    <p style="color:#3A4F4A;font-size:26px;font-weight:700;font-family:monospace;margin:0;letter-spacing:5px;">${b.bookingRef}</p>
  </div>
</td></tr>
<tr><td style="padding:0 40px 24px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E8E4DE;border-radius:12px;overflow:hidden;">
    <tr style="background:#3A4F4A;">
      <td style="padding:12px 16px;" colspan="2">
        <span style="color:#A3C0BE;font-size:13px;font-weight:700;">${b.petName}</span>
        <span style="color:#DBD4C7;font-size:12px;"> · ${b.petBreed}</span>
        <span style="color:#DBD4C7;font-size:14px;font-weight:700;float:right;">${formatPrice(b.price)}</span>
      </td>
    </tr>
    ${emailRow('Service',  `${svcName(b.service)} (~${formatDuration(b.duration)})`)}
    ${emailRow('Date',     formatDate(b.slotDate))}
    ${emailRow('Time',     `${formatTime(b.slotStartTime)} – ~${formatTime(estimatedEnd)}`)}
    ${emailRow('Location', b.area)}
    ${b.address ? emailRow('Address', [b.address, b.buildingNote].filter(Boolean).join(', ')) : ''}
    ${emailRow('Phone',    `${b.ownerName} · ${b.ownerPhone}`)}
  </table>
</td></tr>
<tr><td style="padding:0 40px 32px;">
  <h3 style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#7A8582;margin:0 0 14px;">What Happens Next</h3>
  ${nextItem('No deposit needed — your booking is confirmed')}
  ${nextItem('Our groomer will WhatsApp you 30 min before arrival')}
  ${nextItem('Mobile salon van arrives at your door')}
  ${nextItem('Pay online, cash or card on the day')}
</td></tr>
<tr><td style="background:#F4F2EE;padding:24px 40px;text-align:center;border-top:1px solid #E8E4DE;">
  <p style="color:#7A8582;font-size:11px;margin:0 0 4px;">Scruffs.ae · Est. 2022 · Dubai, UAE</p>
  <p style="color:#A8AFAD;font-size:10px;margin:12px 0 0;">Questions? WhatsApp: +971 50 123 4567</p>
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

/* ── Admin alert email HTML ───────────────────────────────────── */
function adminEmailHtml(b: BookingDetails): string {
  const estimatedEnd = addMins(b.slotStartTime, b.duration);
  const addons = addonsLabel(b.addons);
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>New Booking – Scruffs Admin</title></head>
<body style="margin:0;padding:0;background:#1a1a1a;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:20px 16px;">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;">

<!-- Alert header -->
<tr><td style="background:#3A4F4A;padding:20px 28px;display:flex;align-items:center;">
  <p style="color:#A3C0BE;font-size:10px;font-weight:700;letter-spacing:0.2em;margin:0 0 4px;text-transform:uppercase;">Scruffs Admin Alert</p>
  <h1 style="color:#DBD4C7;font-size:22px;margin:0;letter-spacing:0.12em;font-weight:900;">NEW BOOKING RECEIVED</h1>
</td></tr>

<!-- Booking ref banner -->
<tr><td style="background:#DBD4C7;padding:14px 28px;text-align:center;">
  <p style="color:#3A4F4A;font-size:22px;font-weight:900;font-family:monospace;margin:0;letter-spacing:6px;">${b.bookingRef}</p>
  <p style="color:#3A4F4A;font-size:11px;font-weight:600;margin:4px 0 0;opacity:0.6;">${formatDate(b.slotDate)} · ${formatTime(b.slotStartTime)} → ~${formatTime(estimatedEnd)}</p>
</td></tr>

<!-- Two columns: Pet + Customer -->
<tr><td style="padding:24px 28px;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td width="50%" style="padding-right:12px;vertical-align:top;">
        <p style="color:#7A8582;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 10px;border-bottom:2px solid #F4F2EE;padding-bottom:6px;">Pet & Service</p>
        ${adminRow('Pet', `${b.petName} (${b.petType}${b.petSize ? ', ' + b.petSize : ''})`)}
        ${adminRow('Breed', b.petBreed)}
        ${adminRow('Service', svcName(b.service))}
        ${addons ? adminRow('Add-ons', addons) : ''}
        ${adminRow('Duration', `~${formatDuration(b.duration)}`)}
        ${adminRow('Price', formatPrice(b.price))}
      </td>
      <td width="50%" style="padding-left:12px;vertical-align:top;">
        <p style="color:#7A8582;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 10px;border-bottom:2px solid #F4F2EE;padding-bottom:6px;">Customer</p>
        ${adminRow('Name', b.ownerName)}
        ${adminRow('Phone', b.ownerPhone)}
        ${b.ownerEmail ? adminRow('Email', b.ownerEmail) : ''}
        ${adminRow('Area', b.area)}
        ${adminRow('Address', b.address)}
        ${b.buildingNote ? adminRow('Building', b.buildingNote) : ''}
        ${b.mapsLink ? `<tr><td style="padding:4px 0;" colspan="2"><a href="${b.mapsLink}" style="color:#3A4F4A;font-size:12px;font-weight:700;">View on Maps →</a></td></tr>` : ''}
      </td>
    </tr>
  </table>
</td></tr>

<!-- Quick action buttons -->
<tr><td style="padding:0 28px 24px;">
  <a href="https://wa.me/${b.ownerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${b.ownerName}! This is Scruffs.ae confirming ${b.petName}'s appointment on ${formatDate(b.slotDate)} at ${formatTime(b.slotStartTime)}. Ref: ${b.bookingRef}`)}"
     style="display:inline-block;background:#25D366;color:#ffffff;padding:12px 20px;border-radius:10px;font-weight:700;font-size:13px;text-decoration:none;margin-right:10px;">
     WhatsApp Customer
  </a>
  <a href="https://scruffs.vercel.app/admin"
     style="display:inline-block;background:#3A4F4A;color:#DBD4C7;padding:12px 20px;border-radius:10px;font-weight:700;font-size:13px;text-decoration:none;">
     Open Admin Panel
  </a>
</td></tr>

<tr><td style="background:#F4F2EE;padding:14px 28px;text-align:center;border-top:1px solid #E8E4DE;">
  <p style="color:#7A8582;font-size:10px;margin:0;">Scruffs.ae Admin Notification · Auto-generated</p>
</td></tr>

</table>
</td></tr></table>
</body></html>`;
}

function emailRow(label: string, value: string): string {
  return `<tr><td style="padding:10px 16px;border-top:1px solid #E8E4DE;color:#7A8582;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;width:110px;">${label}</td><td style="padding:10px 16px;border-top:1px solid #E8E4DE;color:#2B3A36;font-size:13px;font-weight:600;">${value}</td></tr>`;
}

function adminRow(label: string, value: string): string {
  return `<tr><td style="padding:3px 0;color:#7A8582;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;width:70px;vertical-align:top;">${label}</td><td style="padding:3px 0;color:#2B3A36;font-size:12px;font-weight:600;">${value}</td></tr>`;
}

function nextItem(text: string): string {
  return `<p style="margin:0 0 10px;color:#2B3A36;font-size:13px;"><span style="color:#A3C0BE;font-weight:700;margin-right:8px;">✓</span>${text}</p>`;
}

/* ── Business WhatsApp message text ──────────────────────────── */
function businessWaMessage(b: BookingDetails): string {
  const estimatedEnd = addMins(b.slotStartTime, b.duration);
  const addons = addonsLabel(b.addons);
  return [
    `*NEW BOOKING — Scruffs*`,
    ``,
    `*Ref:* ${b.bookingRef}`,
    `*Pet:* ${b.petName} (${b.petType}${b.petSize ? ', ' + b.petSize : ''}, ${b.petBreed})`,
    `*Service:* ${svcName(b.service)}${addons ? ' + ' + addons : ''} — ${formatPrice(b.price)}`,
    `*Date:* ${formatDate(b.slotDate)}`,
    `*Time:* ${formatTime(b.slotStartTime)} → ~${formatTime(estimatedEnd)}`,
    `*Area:* ${b.area}`,
    `*Address:* ${b.address}${b.buildingNote ? ', ' + b.buildingNote : ''}`,
    b.mapsLink ? `*Maps:* ${b.mapsLink}` : '',
    ``,
    `*Customer:* ${b.ownerName}`,
    `*Phone:* ${b.ownerPhone}`,
    b.ownerEmail ? `*Email:* ${b.ownerEmail}` : '',
  ].filter((l) => l !== null && l !== undefined).join('\n');
}

/* ── Customer WhatsApp message text ─────────────────────────── */
function customerWaMessage(b: BookingDetails): string {
  const estimatedEnd = addMins(b.slotStartTime, b.duration);
  return [
    `Hi ${b.ownerName}!`,
    ``,
    `Your *Scruffs* booking is *CONFIRMED*.`,
    ``,
    `*Ref:* ${b.bookingRef}`,
    `*Pet:* ${b.petName} (${b.petBreed})`,
    `*Service:* ${svcName(b.service)}`,
    `*Date:* ${formatDate(b.slotDate)}`,
    `*Time:* ${formatTime(b.slotStartTime)} → ~${formatTime(estimatedEnd)}`,
    `*Location:* ${b.area}`,
    `*Price:* ${formatPrice(b.price)}`,
    ``,
    `We'll WhatsApp you *30 min before arrival*. See you soon!`,
    ``,
    `— The Scruffs Team`,
  ].join('\n');
}

/* ── Send email via Resend ───────────────────────────────────── */
async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.startsWith('re_xxx')) {
    console.log(`[Scruffs] Resend not configured — skipping email to ${to}`);
    return;
  }
  try {
    const { Resend } = await import('resend');
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from:    process.env.RESEND_FROM ?? 'Scruffs <bookings@scruffs.ae>',
      to,
      subject,
      html,
    });
    console.log(`[Scruffs] Email sent to ${to}`);
  } catch (err) {
    console.error('[Scruffs] Resend email error:', err);
  }
}

/* ── Send WhatsApp via Twilio ────────────────────────────────── */
async function sendWhatsApp(to: string, body: string): Promise<boolean> {
  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from  = process.env.TWILIO_WHATSAPP_FROM ?? 'whatsapp:+14155238886';

  // Check for placeholder values
  if (!sid || !token || sid.startsWith('ACxxx') || token === 'your_auth_token_here') {
    console.log(`[Scruffs] Twilio not configured — WhatsApp to ${to} skipped`);
    return false;
  }

  try {
    const twilio = (await import('twilio')).default;
    const client = twilio(sid, token);
    await client.messages.create({ from, to: `whatsapp:${to}`, body });
    console.log(`[Scruffs] WhatsApp sent to ${to}`);
    return true;
  } catch (err) {
    console.error(`[Scruffs] WhatsApp error to ${to}:`, err);
    return false;
  }
}

/* ── Send SMS via Twilio (fallback when WhatsApp fails) ──────── */
async function sendSms(to: string, body: string): Promise<void> {
  const sid       = process.env.TWILIO_ACCOUNT_SID;
  const token     = process.env.TWILIO_AUTH_TOKEN;
  const smsFrom   = process.env.TWILIO_SMS_FROM; // your Twilio phone number

  if (!sid || !token || !smsFrom || sid.startsWith('ACxxx')) {
    console.log(`[Scruffs] SMS fallback not configured — skipping SMS to ${to}`);
    return;
  }

  try {
    const twilio = (await import('twilio')).default;
    const client = twilio(sid, token);
    await client.messages.create({ from: smsFrom, to, body });
    console.log(`[Scruffs] SMS sent to ${to}`);
  } catch (err) {
    console.error(`[Scruffs] SMS error to ${to}:`, err);
  }
}

/* ── Public notification functions ──────────────────────────── */

/** Send booking confirmation email to customer */
export async function sendCustomerEmail(b: BookingDetails): Promise<void> {
  if (!b.ownerEmail) return;
  await sendEmail(
    b.ownerEmail,
    `Booking Confirmed — ${b.bookingRef} | ${formatDate(b.slotDate)}`,
    customerEmailHtml(b),
  );
}

/** Send new-booking alert email to admin/groomer */
export async function sendAdminEmail(b: BookingDetails): Promise<void> {
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL;
  if (!adminEmail) {
    console.log('[Scruffs] ADMIN_NOTIFY_EMAIL not set — skipping admin email');
    return;
  }
  await sendEmail(
    adminEmail,
    `NEW BOOKING ${b.bookingRef} — ${b.petName} · ${formatDate(b.slotDate)} · ${formatTime(b.slotStartTime)}`,
    adminEmailHtml(b),
  );
}

/** Send WhatsApp confirmation to the customer */
export async function sendCustomerWhatsApp(b: BookingDetails): Promise<void> {
  await sendWhatsApp(b.ownerPhone, customerWaMessage(b));
}

/** Notify business WhatsApp with new booking — falls back to SMS if WA fails */
export async function notifyBusinessWhatsApp(b: BookingDetails): Promise<void> {
  const bizPhone = process.env.BUSINESS_NOTIFY_PHONE;
  if (!bizPhone || bizPhone === '+971XXXXXXXXX') {
    console.log('[Scruffs] BUSINESS_NOTIFY_PHONE not set — skipping business notification');
    return;
  }
  const waSent = await sendWhatsApp(bizPhone, businessWaMessage(b));
  if (!waSent) {
    // Fallback: try SMS to the same business number
    const shortMsg = `NEW BOOKING ${b.bookingRef}: ${b.petName} (${b.petBreed}) · ${formatDate(b.slotDate)} ${formatTime(b.slotStartTime)} · ${b.area} · ${b.ownerName} ${b.ownerPhone} · ${formatPrice(b.price)}`;
    await sendSms(bizPhone, shortMsg);
  }
}

/** Fire ALL notifications after a booking is created */
export async function sendAllNotifications(b: BookingDetails): Promise<void> {
  await Promise.allSettled([
    sendCustomerEmail(b),       // → customer's email
    sendAdminEmail(b),          // → your email (rich HTML with WhatsApp button)
    sendCustomerWhatsApp(b),    // → customer's WhatsApp
    notifyBusinessWhatsApp(b),  // → your WhatsApp (falls back to SMS)
  ]);
}
