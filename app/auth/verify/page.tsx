'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';

export default function VerifyPage() {
  const router = useRouter();
  const [phone,     setPhone]     = useState('');
  const [devOtp,    setDevOtp]    = useState('');
  const [otp,       setOtp]       = useState(['', '', '', '', '', '']);
  const [loading,   setLoading]   = useState(false);
  const [resending, setResending] = useState(false);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const p = sessionStorage.getItem('auth_phone') ?? '';
    const d = sessionStorage.getItem('auth_dev_otp') ?? '';
    setPhone(p);
    setDevOtp(d);
    if (!p) router.replace('/auth');
    inputs.current[0]?.focus();
  }, [router]);

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
      if (!res.ok) { setError(json.error ?? 'Invalid code'); setLoading(false); return; }

      setSuccess(true);
      sessionStorage.removeItem('auth_phone');
      sessionStorage.removeItem('auth_dev_otp');

      setTimeout(() => {
        if (!json.user?.name) {
          router.push('/profile?setup=1');
        } else {
          router.push('/?welcome=1');
        }
      }, 1000);
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const res  = await fetch('/api/auth/send-otp', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ phone }),
      });
      const json = await res.json();
      if (json.devOtp) {
        setDevOtp(json.devOtp);
        sessionStorage.setItem('auth_dev_otp', json.devOtp);
      }
      setOtp(['', '', '', '', '', '']);
      setError('');
      setCountdown(60);
      setTimeout(() => inputs.current[0]?.focus(), 100);
    } finally {
      setResending(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center">
          <Check size={36} className="text-primary" strokeWidth={2.5} />
        </div>
        <p className="font-bold text-foreground text-xl">Verified!</p>
        <p className="text-muted-foreground text-sm">Taking you in…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-primary px-4 py-3.5 flex items-center gap-3">
        <Link href="/auth" className="w-8 h-8 rounded-xl bg-primary-foreground/10 flex items-center justify-center text-primary-foreground/80 hover:bg-primary-foreground/20 transition-colors">
          <ArrowLeft size={17} strokeWidth={2.5} />
        </Link>
        <Image src="/logo-icon-beige.png" alt="Scruffs" width={30} height={30} className="rounded-xl" />
        <span className="text-primary-foreground font-black text-sm tracking-[0.15em]">SCRUFFS</span>
      </div>

      <main className="flex-1 max-w-lg mx-auto w-full px-5 py-10 space-y-7">

        <div className="text-center space-y-2">
          <h1 className="font-bold text-2xl text-foreground">Enter the code</h1>
          <p className="text-muted-foreground text-sm">
            Sent to <strong className="text-foreground font-bold">{phone}</strong>
          </p>
        </div>

        {/* Dev / no-SMS banner — shows code when Twilio not configured */}
        {devOtp && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl px-4 py-3.5 text-center space-y-1">
            <p className="text-amber-600 dark:text-amber-400 text-[11px] font-bold uppercase tracking-widest">
              SMS not sent — use this code
            </p>
            <p className="font-mono font-black text-3xl tracking-[0.4em] text-foreground">{devOtp}</p>
          </div>
        )}

        {/* OTP input boxes */}
        <div className="flex gap-2 justify-center" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={2}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              autoFocus={i === 0}
              className={`w-11 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all ${
                digit
                  ? 'border-primary bg-primary/8 text-primary'
                  : error
                    ? 'border-destructive bg-destructive/5 text-foreground'
                    : 'border-border bg-card text-foreground focus:border-primary'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-destructive text-sm font-medium text-center">{error}</p>
        )}

        <button
          onClick={() => handleVerify(otp.join(''))}
          disabled={loading || otp.some((d) => !d)}
          className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading
            ? <><Loader2 size={15} className="animate-spin" /> Verifying…</>
            : 'Verify Code'
          }
        </button>

        <div className="text-center">
          {countdown > 0 ? (
            <p className="text-sm text-muted-foreground">
              Resend in <strong className="text-foreground">{countdown}s</strong>
            </p>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-sm font-bold text-primary hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              {resending ? 'Sending…' : 'Resend code'}
            </button>
          )}
        </div>

      </main>
    </div>
  );
}
