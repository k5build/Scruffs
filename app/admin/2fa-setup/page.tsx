/**
 * /admin/2fa-setup — TOTP two-factor authentication setup page.
 * Server component — protected by admin cookie.
 * Dark theme matching admin panel (bg #0f1a18).
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAdminToken, ADMIN_COOKIE_NAME } from '@/lib/adminAuth';
import { generateTotpSecret, getTotpUri } from '@/lib/totp';
import TwoFASetupClient from './TwoFASetupClient';

export const dynamic = 'force-dynamic';

export default async function TwoFASetupPage() {
  // Protect: require admin cookie
  const cookieStore = cookies();
  const token       = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token || !(await verifyAdminToken(token))) {
    redirect('/admin/login?from=/admin/2fa-setup');
  }

  // Read existing secret from env, or generate a new one to display
  const existingSecret = process.env.ADMIN_TOTP_SECRET ?? null;
  const displaySecret  = existingSecret ?? generateTotpSecret();
  const isConfigured   = Boolean(existingSecret);

  const otpauthUri = getTotpUri(displaySecret, 'admin@scruffs.ae', 'Scruffs Admin');
  const qrUrl      = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUri)}`;

  return (
    <TwoFASetupClient
      secret={displaySecret}
      qrUrl={qrUrl}
      isConfigured={isConfigured}
    />
  );
}
