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

/* ── Email HTML template ─────────────────────────────────────── */
function bookingEmailHtml(b: BookingDetails): string {
  const estimatedEnd = addMins(b.slotStartTime, b.duration);
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Booking Confirmed – Scruffs</title></head>
<body style="margin:0;padding:0;background:#F4F2EE;font-family:Arial,Helvetica,sans-serif;color:#2B3A36;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 16px;">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(58,79,74,0.10);">

<!-- Header -->
<tr><td style="background:#3A4F4A;padding:36px 40px;text-align:center;">
  <p style="color:#A3C0BE;font-size:11px;font-weight:700;letter-spacing:0.2em;margin:0 0 8px;text-transform:uppercase;">Mobile Pet Grooming · Dubai</p>
  <h1 style="color:#DBD4C7;font-size:32px;margin:0;letter-spacing:0.22em;font-weight:900;">SCRUFFS</h1>
</td></tr>

<!-- Hero text -->
<tr><td style="padding:36px 40px 24px;text-align:center;">
  <div style="width:64px;height:64px;background:#A3C0BE;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
    <span style="color:#3A4F4A;font-size:28px;font-weight:900;">✓</span>
  </div>
  <h2 style="font-size:24px;margin:0 0 8px;color:#2B3A36;">Booking Confirmed!</h2>
  <p style="color:#7A8582;font-size:15px;margin:0;">${b.petName} is in for a treat. See you on ${formatDate(b.slotDate)}!</p>
</td></tr>

<!-- Booking ref -->
<tr><td style="padding:0 40px 24px;">
  <div style="background:#F4F2EE;border-radius:12px;padding:20px;text-align:center;">
    <p style="color:#7A8582;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 8px;">Booking Reference</p>
    <p style="color:#3A4F4A;font-size:26px;font-weight:700;font-family:monospace;margin:0;letter-spacing:5px;">${b.bookingRef}</p>
  </div>
</td></tr>

<!-- Details -->
<tr><td style="padding:0 40px 24px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E8E4DE;border-radius:12px;overflow:hidden;">
    <tr style="background:#3A4F4A;">
      <td style="padding:12px 16px;" colspan="2">
        <span style="color:#A3C0BE;font-size:13px;font-weight:700;">🐾 ${b.petName}</span>
        <span style="color:#DBD4C7;font-size:12px;"> · ${b.petBreed}</span>
        <span style="color:#DBD4C7;font-size:14px;font-weight:700;float:right;">${formatPrice(b.price)}</span>
      </td>
    </tr>
    ${row('Service',  `${svcName(b.service)} (~${formatDuration(b.duration)})`)}
    ${row('Date',     formatDate(b.slotDate))}
    ${row('Time',     `${formatTime(b.slotStartTime)} → ~${formatTime(estimatedEnd)}`)}
    ${row('Location', b.area)}
    ${b.address ? row('Address',  [b.address, b.buildingNote].filter(Boolean).join(', ')) : ''}
    ${row('Phone',    b.ownerName + ' · ' + b.ownerPhone)}
  </table>
</td></tr>

<!-- Price footer -->
<tr><td style="padding:0 40px 24px;">
  <div style="background:#DBD4C7;border-radius:12px;padding:16px 20px;display:flex;">
    <span style="color:#7A8582;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;">Total – Pay on the day</span>
    <span style="color:#3A4F4A;font-size:20px;font-weight:900;margin-left:auto;">${formatPrice(b.price)}</span>
  </div>
</td></tr>

<!-- What's next -->
<tr><td style="padding:0 40px 32px;">
  <h3 style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#7A8582;margin:0 0 14px;">What Happens Next</h3>
  ${nextItem('No deposit needed — your booking is confirmed')}
  ${nextItem('Our groomer will WhatsApp you 30 min before arrival')}
  ${nextItem('Mobile salon van arrives at your door')}
  ${nextItem('Pay cash or card on the day')}
</td></tr>

<!-- Footer -->
<tr><td style="background:#F4F2EE;padding:24px 40px;text-align:center;border-top:1px solid #E8E4DE;">
  <p style="color:#7A8582;font-size:11px;margin:0 0 4px;">Scruffs.ae · Est. 2022 · Dubai, UAE</p>
  <p style="color:#7A8582;font-size:11px;margin:0;">Professional Mobile Pet Grooming</p>
  <p style="color:#A8AFAD;font-size:10px;margin:12px 0 0;">Questions? WhatsApp us: +971 50 123 4567</p>
</td></tr>

</table>
</td></tr></table>
</body>
</html>`;
}

function row(label: string, value: string): string {
  return `<tr><td style="padding:10px 16px;border-top:1px solid #E8E4DE;color:#7A8582;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;width:110px;">${label}</td><td style="padding:10px 16px;border-top:1px solid #E8E4DE;color:#2B3A36;font-size:13px;font-weight:600;">${value}</td></tr>`;
}

function nextItem(text: string): string {
  return `<p style="margin:0 0 10px;color:#2B3A36;font-size:13px;"><span style="color:#A3C0BE;font-weight:700;margin-right:8px;">✓</span>${text}</p>`;
}

function addMins(time: string, mins: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + mins;
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

/* ── Business WhatsApp message ───────────────────────────────── */
function businessWaMessage(b: BookingDetails): string {
  const estimatedEnd = addMins(b.slotStartTime, b.duration);
  return [
    `🔔 *NEW BOOKING – Scruffs*`,
    ``,
    `📋 *Ref:* ${b.bookingRef}`,
    `🐾 *Pet:* ${b.petName} (${b.petType}${b.petSize ? ', ' + b.petSize : ''}, ${b.petBreed})`,
    `✂️ *Service:* ${svcName(b.service)}${addonsLabel(b.addons) ? ' + ' + addonsLabel(b.addons) : ''} – AED ${b.price}`,
    `📅 *Date:* ${formatDate(b.slotDate)}`,
    `⏰ *Time:* ${formatTime(b.slotStartTime)} → ~${formatTime(estimatedEnd)}`,
    `📍 *Area:* ${b.area}`,
    `🏠 *Address:* ${b.address}${b.buildingNote ? ', ' + b.buildingNote : ''}`,
    b.mapsLink ? `🗺️ *Maps:* ${b.mapsLink}` : '',
    ``,
    `👤 *Customer:* ${b.ownerName}`,
    `📱 *Phone:* ${b.ownerPhone}`,
  ].filter((l) => l !== null).join('\n');
}

/* ── Customer WhatsApp message ───────────────────────────────── */
function customerWaMessage(b: BookingDetails): string {
  const estimatedEnd = addMins(b.slotStartTime, b.duration);
  return [
    `Hi ${b.ownerName}! 🐾`,
    ``,
    `Your *Scruffs* booking is *CONFIRMED*!`,
    ``,
    `📋 Ref: *${b.bookingRef}*`,
    `🐾 ${b.petName} (${b.petBreed})`,
    `✂️ ${svcName(b.service)}${addonsLabel(b.addons) ? ' + ' + addonsLabel(b.addons) : ''}`,
    `📅 ${formatDate(b.slotDate)}`,
    `⏰ ${formatTime(b.slotStartTime)} → ~${formatTime(estimatedEnd)}`,
    `📍 ${b.area}`,
    `💰 AED ${b.price} (pay on the day)`,
    ``,
    `We'll WhatsApp you *30 min before arrival*. See you soon!`,
    ``,
    `– The Scruffs Team 🐶🐱`,
  ].join('\n');
}

/* ── Send email via Resend ───────────────────────────────────── */
export async function sendBookingEmail(b: BookingDetails): Promise<void> {
  if (!b.ownerEmail) return;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log('[Scruffs] RESEND_API_KEY not set – skipping email');
    return;
  }

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from:    process.env.RESEND_FROM ?? 'Scruffs <bookings@scruffs.ae>',
      to:      b.ownerEmail,
      subject: `Booking Confirmed – ${b.bookingRef} | ${formatDate(b.slotDate)}`,
      html:    bookingEmailHtml(b),
    });
    console.log(`[Scruffs] Email sent to ${b.ownerEmail}`);
  } catch (err) {
    console.error('[Scruffs] Email error:', err);
  }
}

/* ── Send WhatsApp via Twilio ────────────────────────────────── */
async function sendWhatsApp(to: string, body: string): Promise<void> {
  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from  = process.env.TWILIO_WHATSAPP_FROM ?? 'whatsapp:+14155238886';

  if (!sid || !token) {
    console.log(`[Scruffs] Twilio not configured – WA to ${to}:\n${body}`);
    return;
  }

  try {
    const twilio = (await import('twilio')).default;
    const client = twilio(sid, token);
    await client.messages.create({
      from,
      to:   `whatsapp:${to}`,
      body,
    });
    console.log(`[Scruffs] WhatsApp sent to ${to}`);
  } catch (err) {
    console.error(`[Scruffs] WhatsApp error to ${to}:`, err);
  }
}

/** Send WhatsApp confirmation to the customer */
export async function sendCustomerWhatsApp(b: BookingDetails): Promise<void> {
  await sendWhatsApp(b.ownerPhone, customerWaMessage(b));
}

/** Notify the business team WhatsApp number about a new booking */
export async function notifyBusinessWhatsApp(b: BookingDetails): Promise<void> {
  const bizPhone = process.env.BUSINESS_NOTIFY_PHONE;
  if (!bizPhone) {
    console.log('[Scruffs] BUSINESS_NOTIFY_PHONE not set – skipping business WA');
    return;
  }
  await sendWhatsApp(bizPhone, businessWaMessage(b));
}

/** Fire all notifications after a booking is created */
export async function sendAllNotifications(b: BookingDetails): Promise<void> {
  await Promise.allSettled([
    sendBookingEmail(b),
    sendCustomerWhatsApp(b),
    notifyBusinessWhatsApp(b),
  ]);
}
