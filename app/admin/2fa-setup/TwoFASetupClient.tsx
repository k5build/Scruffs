'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Eye, EyeOff, ShieldCheck, Copy, Check, AlertCircle, CheckCircle } from 'lucide-react';

interface Props {
  secret:       string;
  qrUrl:        string;
  isConfigured: boolean;
}

export default function TwoFASetupClient({ secret, qrUrl, isConfigured }: Props) {
  const [showSecret, setShowSecret] = useState(false);
  const [copied,     setCopied]     = useState(false);

  const copySecret = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  const maskedSecret = secret.slice(0, 4) + '****' + secret.slice(-4);

  return (
    <div className="min-h-screen p-6 md:p-10" style={{ background: '#0f1a18', color: 'white' }}>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl overflow-hidden ring-2 ring-white/10 flex-shrink-0">
            <Image src="/logo-icon-beige.png" alt="Scruffs" width={48} height={48} className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-wide">Two-Factor Authentication Setup</h1>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Scruffs Admin Panel · 2FA Configuration</p>
          </div>
        </div>

        {/* Status banner */}
        {isConfigured ? (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-8"
            style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)' }}>
            <CheckCircle size={16} style={{ color: '#4ade80' }} />
            <p className="text-sm" style={{ color: '#86efac' }}>
              TOTP 2FA is <strong>active</strong>. Your ADMIN_TOTP_SECRET is set. The QR below reflects your current secret.
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-8"
            style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
            <AlertCircle size={16} style={{ color: '#fbbf24' }} />
            <p className="text-sm" style={{ color: '#fde68a' }}>
              ADMIN_TOTP_SECRET is <strong>not set</strong>. A new secret has been generated below.
              Follow the steps to enable 2FA.
            </p>
          </div>
        )}

        {/* Steps */}
        <div className="space-y-6">

          {/* Step 1 */}
          <Step number={1} title="Install an authenticator app">
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Download <strong style={{ color: 'white' }}>Google Authenticator</strong> or{' '}
              <strong style={{ color: 'white' }}>Authy</strong> on your phone if you haven&apos;t already.
            </p>
          </Step>

          {/* Step 2 — QR Code */}
          <Step number={2} title="Scan the QR code">
            <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Open your authenticator app, tap <strong style={{ color: 'white' }}>Add account</strong>,
              then scan this QR code.
            </p>
            <div className="flex items-center gap-6">
              <div className="rounded-2xl p-3 flex-shrink-0"
                style={{ background: 'white', display: 'inline-block' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrUrl}
                  alt="TOTP QR Code"
                  width={180}
                  height={180}
                  style={{ display: 'block' }}
                />
              </div>
              <div>
                <p className="text-xs font-bold mb-2" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Or enter manually
                </p>
                <div className="flex items-center gap-2">
                  <code
                    className="px-3 py-2 rounded-lg text-sm font-mono break-all"
                    style={{ background: 'rgba(255,255,255,0.06)', color: '#A3C0BE', letterSpacing: '0.08em' }}
                  >
                    {showSecret ? secret : maskedSecret}
                  </code>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors"
                    style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}
                  >
                    {showSecret ? <EyeOff size={12} /> : <Eye size={12} />}
                    {showSecret ? 'Hide' : 'Show'}
                  </button>
                  <button
                    type="button"
                    onClick={copySecret}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors"
                    style={{ background: 'rgba(255,255,255,0.06)', color: copied ? '#4ade80' : 'rgba(255,255,255,0.5)' }}
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
          </Step>

          {/* Step 3 — Add env var */}
          <Step number={3} title="Add the secret to your environment">
            <p className="text-sm mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Add the following variable to your Vercel project environment (Settings → Environment Variables):
            </p>
            <div className="rounded-xl p-4" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-xs font-bold mb-1" style={{ color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Variable</p>
              <code className="text-sm font-mono" style={{ color: '#A3C0BE' }}>ADMIN_TOTP_SECRET</code>
              <p className="text-xs font-bold mt-3 mb-1" style={{ color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Value</p>
              <code className="text-sm font-mono break-all" style={{ color: 'white' }}>
                {showSecret ? secret : maskedSecret}
              </code>
            </div>
          </Step>

          {/* Step 4 — Redeploy */}
          <Step number={4} title="Redeploy">
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
              After saving the env var, trigger a new Vercel deployment so the app picks it up.
              On the next login you will be prompted for the 6-digit code after entering your password.
            </p>
          </Step>

        </div>

        {/* Security note */}
        <div className="mt-8 flex items-start gap-3 px-4 py-3 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <ShieldCheck size={16} className="flex-shrink-0 mt-0.5" style={{ color: 'rgba(163,192,190,0.6)' }} />
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Keep your TOTP secret confidential. If you lose access to your authenticator app,
            remove ADMIN_TOTP_SECRET from Vercel and redeploy to fall back to password-only login,
            then set up 2FA again with a new secret.
          </p>
        </div>

        <p className="text-center text-xs mt-8" style={{ color: 'rgba(255,255,255,0.15)' }}>
          Scruffs.ae · Admin Security Settings
        </p>
      </div>
    </div>
  );
}

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
          style={{ background: 'rgba(163,192,190,0.15)', color: '#A3C0BE', border: '1px solid rgba(163,192,190,0.3)' }}>
          {number}
        </div>
        <h2 className="text-sm font-bold text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}
