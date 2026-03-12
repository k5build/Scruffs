'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Phone, ChevronRight, Loader2 } from 'lucide-react';

function AuthForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const oauthError   = searchParams.get('error');

  const [phone,   setPhone]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(
    oauthError === 'google_denied' ? 'Google sign-in was cancelled.' :
    oauthError === 'google_failed' ? 'Google sign-in failed. Please try again.' :
    oauthError === 'apple_denied'  ? 'Apple sign-in was cancelled.' :
    oauthError === 'apple_failed'  ? 'Apple sign-in failed. Please try again.' : ''
  );

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = phone.trim();
    if (!cleaned) { setError('Enter your phone number'); return; }

    // Accept any number with at least 7 digits
    const digits = cleaned.replace(/\D/g, '');
    if (digits.length < 7) {
      setError('Enter a valid phone number');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res  = await fetch('/api/auth/send-otp', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ phone: cleaned }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? 'Something went wrong'); return; }
      sessionStorage.setItem('auth_phone', json.phone);
      sessionStorage.setItem('auth_channel', json.channel ?? 'sms');
      if (json.devOtp) sessionStorage.setItem('auth_dev_otp', json.devOtp);
      router.push('/auth/verify');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* Hero splash */}
      <div className="bg-primary px-6 pt-16 pb-12 flex flex-col items-center text-center">
        <div className="mb-5">
          <Image
            src="/logo-icon-beige.png"
            alt="Scruffs"
            width={96}
            height={96}
            className="rounded-3xl shadow-lg"
          />
        </div>
        <p className="text-primary-foreground/60 text-[11px] font-bold tracking-[0.3em] uppercase mb-1">Welcome to</p>
        <h1 className="text-primary-foreground font-black text-4xl tracking-[0.12em] mb-1">SCRUFFS</h1>
        <p className="text-primary-foreground/70 text-xs font-semibold tracking-widest uppercase">Extraordinary Pet Groomers</p>
        <p className="text-primary-foreground/60 text-sm mt-4 max-w-xs leading-relaxed">
          Dubai&apos;s mobile pet grooming — we come to your door.
        </p>
      </div>

      <main className="flex-1 max-w-lg mx-auto w-full px-5 py-8 space-y-4">

        {/* Social login */}
        <div className="space-y-3">
          <a
            href="/api/auth/google"
            className="w-full flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3.5 hover:bg-secondary/50 transition-colors"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="font-bold text-foreground text-sm flex-1">Continue with Google</span>
          </a>

          <a
            href="/api/auth/apple"
            className="w-full flex items-center gap-3 bg-foreground border border-border rounded-2xl px-4 py-3.5 hover:opacity-90 transition-opacity"
          >
            <svg className="w-5 h-5 flex-shrink-0 text-background" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            <span className="font-bold text-background text-sm flex-1">Continue with Apple</span>
          </a>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Phone OTP */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Phone size={15} className="text-primary" strokeWidth={2} />
            </div>
            <div>
              <p className="font-bold text-foreground text-sm">Phone Number</p>
              <p className="text-[11px] text-muted-foreground">We&apos;ll send a 6-digit code via WhatsApp or SMS</p>
            </div>
          </div>

          <form onSubmit={handlePhoneSubmit} className="space-y-3">
            <div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setError(''); }}
                placeholder="+971 50 123 4567 or +44 7911 123456"
                className="input-field"
                autoComplete="tel"
                inputMode="tel"
              />
              <p className="text-[11px] text-muted-foreground mt-1.5">
                UAE: 050 xxx xxxx · International: +country code + number
              </p>
            </div>

            {error && <p className="text-destructive text-sm font-medium">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading
                ? <><Loader2 size={15} className="animate-spin" /> Sending…</>
                : <>Send Code <ChevronRight size={15} /></>
              }
            </button>
          </form>
        </div>

        {/* Terms */}
        <p className="text-center text-[11px] text-muted-foreground px-4 leading-relaxed">
          By continuing you agree to our{' '}
          <Link href="/terms" className="text-primary font-semibold hover:underline">Terms</Link>
          {' & '}
          <Link href="/privacy" className="text-primary font-semibold hover:underline">Privacy Policy</Link>
        </p>

        {/* Guest */}
        <div className="text-center pb-4">
          <a
            href="/api/auth/guest"
            className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            Browse as guest
          </a>
        </div>

      </main>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  );
}
