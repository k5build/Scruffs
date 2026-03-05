'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function VerifyPage() {
  const router = useRouter();
  const [phone,    setPhone]    = useState('');
  const [devOtp,   setDevOtp]   = useState('');
  const [otp,      setOtp]      = useState(['', '', '', '', '', '']);
  const [loading,  setLoading]  = useState(false);
  const [resending, setResending] = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const p = sessionStorage.getItem('auth_phone') ?? '';
    const d = sessionStorage.getItem('auth_dev_otp') ?? '';
    setPhone(p);
    setDevOtp(d);
    if (!p) router.replace('/auth');
  }, [router]);

  // Countdown for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleChange = (i: number, val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[i] = cleaned;
    setOtp(next);
    setError('');
    if (cleaned && i < 5) inputs.current[i + 1]?.focus();
    // Auto-submit when all 6 filled
    if (cleaned && i === 5 && next.every((d) => d !== '')) {
      handleVerify(next.join(''));
    }
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length === 6) {
      setOtp(text.split(''));
      inputs.current[5]?.focus();
      handleVerify(text);
    }
  };

  const handleVerify = async (code: string) => {
    if (code.length < 6) { setError('Enter the 6-digit code'); return; }
    setLoading(true);
    setError('');

    try {
      const res  = await fetch('/api/auth/verify-otp', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ phone, code }),
      });
      const json = await res.json();

      if (!res.ok) { setError(json.error ?? 'Invalid code'); return; }

      setSuccess(true);
      sessionStorage.removeItem('auth_phone');
      sessionStorage.removeItem('auth_dev_otp');

      // If profile is incomplete (no name), go to profile
      if (!json.user?.name) {
        setTimeout(() => router.push('/profile?setup=1'), 1200);
      } else {
        setTimeout(() => router.push('/'), 1200);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await fetch('/api/auth/send-otp', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ phone }),
      });
      setOtp(['', '', '', '', '', '']);
      setError('');
      setCountdown(60);
      inputs.current[0]?.focus();
    } finally {
      setResending(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center">
          <CheckCircle size={40} className="text-accent-foreground" strokeWidth={1.8} />
        </div>
        <h2 className="font-display font-extrabold text-xl text-foreground">Verified!</h2>
        <p className="text-muted-foreground text-sm">Taking you to your account…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-primary px-4 py-3.5 flex items-center gap-3">
        <Link href="/auth" className="p-1.5 rounded-xl text-primary-foreground/80 hover:bg-white/10 transition-colors">
          <ArrowLeft size={20} strokeWidth={2.5} />
        </Link>
        <Image src="/logo-icon-beige.png" alt="Scruffs" width={28} height={28} className="rounded-full opacity-80" />
        <span className="text-primary-foreground font-display font-black text-sm tracking-[0.15em]">SCRUFFS</span>
      </div>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-10 space-y-8">

        <div className="text-center space-y-2">
          <h1 className="font-display font-extrabold text-2xl text-foreground">Enter the code</h1>
          <p className="text-muted-foreground text-sm">
            We sent a 6-digit code to <strong className="text-foreground">{phone}</strong>
          </p>
        </div>

        {/* Dev helper banner */}
        {devOtp && process.env.NODE_ENV !== 'production' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-center">
            <p className="text-amber-800 text-xs font-bold uppercase tracking-wide mb-1">Dev Mode – SMS not sent</p>
            <p className="text-amber-900 font-mono font-bold text-2xl tracking-widest">{devOtp}</p>
          </div>
        )}

        <Card className="p-6 shadow-brand-md">
          <div className="space-y-6">
            {/* OTP inputs */}
            <div className="flex gap-3 justify-center" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  autoFocus={i === 0}
                  className={`w-12 h-14 text-center text-2xl font-bold font-display rounded-xl border-2 transition-all outline-none focus:ring-2 focus:ring-ring ${
                    digit
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border text-foreground hover:border-accent'
                  }`}
                />
              ))}
            </div>

            {error && <p className="text-destructive text-sm text-center font-medium">{error}</p>}

            <Button
              onClick={() => handleVerify(otp.join(''))}
              disabled={loading || otp.some((d) => !d)}
              className="w-full h-12 font-display font-bold tracking-wide"
            >
              {loading ? 'Verifying…' : 'Verify Code'}
            </Button>

            <div className="text-center">
              {countdown > 0 ? (
                <p className="text-xs text-muted-foreground">
                  Resend code in <strong>{countdown}s</strong>
                </p>
              ) : (
                <Button
                  onClick={handleResend}
                  disabled={resending}
                  variant="ghost"
                  className="text-accent-foreground font-semibold text-sm"
                >
                  {resending ? 'Sending…' : 'Resend code'}
                </Button>
              )}
            </div>
          </div>
        </Card>

      </main>
    </div>
  );
}
