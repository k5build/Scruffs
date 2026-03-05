'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Phone, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AuthPage() {
  const router = useRouter();
  const [phone,    setPhone]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) { setError('Enter your phone number'); return; }
    setLoading(true);
    setError('');

    try {
      const res  = await fetch('/api/auth/send-otp', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ phone: phone.trim() }),
      });
      const json = await res.json();

      if (!res.ok) { setError(json.error ?? 'Something went wrong'); return; }

      // Store phone + devOtp (if dev mode) in sessionStorage for the verify page
      sessionStorage.setItem('auth_phone', phone.trim());
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
      {/* Header */}
      <div className="bg-primary px-4 py-3.5 flex items-center gap-3">
        <Link href="/" className="p-1.5 rounded-xl text-primary-foreground/80 hover:bg-white/10 transition-colors">
          <ArrowLeft size={20} strokeWidth={2.5} />
        </Link>
        <Image src="/logo-icon-beige.png" alt="Scruffs" width={28} height={28} className="rounded-full opacity-80" />
        <span className="text-primary-foreground font-display font-black text-sm tracking-[0.15em]">SCRUFFS</span>
      </div>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-10 space-y-8">

        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Phone size={28} className="text-primary-foreground" strokeWidth={1.8} />
          </div>
          <h1 className="font-display font-extrabold text-2xl text-foreground">Welcome to Scruffs</h1>
          <p className="text-muted-foreground text-sm">
            Sign in with your phone number to save your pets, view bookings and rebook in seconds.
          </p>
        </div>

        <Card className="p-6 shadow-brand-md">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="phone">Mobile Number</Label>
              <div className="relative mt-2">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                  <span className="text-lg">🇦🇪</span>
                  <span className="text-sm font-bold text-muted-foreground">+971</span>
                </div>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setError(''); }}
                  placeholder="50 123 4567"
                  className="pl-20"
                  autoComplete="tel"
                  inputMode="tel"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                We&apos;ll send a 6-digit code via SMS to verify your number.
              </p>
            </div>

            {error && (
              <p className="text-destructive text-sm font-medium">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 font-display font-bold tracking-wide"
            >
              {loading ? 'Sending code…' : 'Send Verification Code'}
              {!loading && <ChevronRight size={16} />}
            </Button>
          </form>
        </Card>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            By signing in you agree to our{' '}
            <Link href="/terms" className="text-accent-foreground font-semibold hover:underline">Terms</Link>
            {' & '}
            <Link href="/privacy" className="text-accent-foreground font-semibold hover:underline">Privacy Policy</Link>
          </p>
        </div>

        <div className="text-center">
          <Button asChild variant="ghost" className="text-muted-foreground font-semibold">
            <Link href="/">Continue as guest</Link>
          </Button>
        </div>

      </main>
    </div>
  );
}
