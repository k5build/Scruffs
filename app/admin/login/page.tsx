'use client';

import { useState, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') ?? '/admin';

  const [password, setPassword] = useState('');
  const [show,     setShow]     = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) { setError('Incorrect password. Please try again.'); return; }
      router.push(from);
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#0f1a18' }}>

      {/* Left decorative panel — hidden on mobile */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 relative overflow-hidden p-10"
        style={{ background: 'linear-gradient(160deg, #2d3f3b 0%, #3A4F4A 60%, #1e2e2b 100%)' }}>

        {/* Background circles */}
        <div className="absolute top-[-80px] right-[-80px] w-72 h-72 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #A3C0BE, transparent)' }} />
        <div className="absolute bottom-[-60px] left-[-60px] w-56 h-56 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #A3C0BE, transparent)' }} />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-12 h-12 rounded-2xl overflow-hidden ring-2 ring-white/20"
            style={{ boxShadow: '0 0 20px rgba(163,192,190,0.2)' }}>
            <Image src="/logo-icon-beige.png" alt="Scruffs" width={48} height={48} className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="font-black text-white tracking-widest text-base">SCRUFFS</p>
            <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: 'rgba(163,192,190,0.6)' }}>Admin Panel</p>
          </div>
        </div>

        {/* Tagline */}
        <div className="relative z-10">
          <p className="text-white/20 text-xs uppercase tracking-widest mb-4">Mobile Pet Grooming · Dubai</p>
          <h2 className="text-3xl font-black text-white leading-tight">
            Manage your<br />
            <span style={{ color: '#A3C0BE' }}>grooming</span><br />
            business.
          </h2>
          <p className="text-white/40 text-sm mt-4">Bookings, slots, loyalty and promotions all in one place.</p>
        </div>

        {/* Bottom stats */}
        <div className="flex gap-6 relative z-10">
          {[['Appointments', 'Tracked'], ['Loyalty', 'Rewards'], ['Promotions', 'Manager']].map(([a, b]) => (
            <div key={a}>
              <p className="text-white font-black text-base">{a}</p>
              <p className="text-white/40 text-[11px]">{b}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right — login form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">

        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(58,79,74,0.15) 0%, transparent 70%)' }} />

        <div className="w-full max-w-sm relative z-10">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl overflow-hidden ring-1 ring-white/10">
              <Image src="/logo-icon-beige.png" alt="Scruffs" width={40} height={40} className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="font-black text-white tracking-widest text-sm">SCRUFFS</p>
              <p className="text-[10px] text-white/30 tracking-widest uppercase">Admin</p>
            </div>
          </div>

          <h1 className="text-2xl font-black text-white mb-1">Welcome back</h1>
          <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.35)' }}>Enter your admin password to continue.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Password field */}
            <div>
              <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  autoFocus
                  required
                  className="w-full px-4 py-3.5 pr-12 rounded-xl text-sm font-medium outline-none transition-all duration-200 border"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    borderColor: error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)',
                    color: 'white',
                  }}
                  onFocus={(e) => { if (!error) e.target.style.borderColor = 'rgba(163,192,190,0.5)'; }}
                  onBlur={(e) => { if (!error) e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 px-3.5 py-3 rounded-xl text-sm"
                style={{ background: 'rgba(239,68,68,0.1)', borderLeft: '3px solid #ef4444', color: '#fca5a5' }}>
                <AlertCircle size={14} className="flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !password}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-200 disabled:opacity-40 hover:-translate-y-0.5 active:translate-y-0"
              style={{
                background: 'linear-gradient(135deg, #3A4F4A 0%, #2d5c54 100%)',
                boxShadow: '0 4px 20px rgba(58,79,74,0.4)',
              }}
            >
              {loading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><span>Sign in</span><ArrowRight size={15} /></>
              }
            </button>
          </form>

          <p className="text-center text-xs mt-6" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Scruffs.ae · Secured Admin Access
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
