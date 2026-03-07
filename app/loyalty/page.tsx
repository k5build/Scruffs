'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Star, Gift, TrendingUp, Clock, ChevronRight, RotateCcw, X, Wallet } from 'lucide-react';
import { loyaltyProgress, LOYALTY_TIERS } from '@/lib/utils';
import BottomNav from '@/components/BottomNav';

interface LoyaltyData {
  points:       number;
  tier:         string;
  name:         string | null;
  phone:        string | null;
  email:        string | null;
  userId:       string;
  bookingCount: number;
  transactions: Array<{
    id:        string;
    points:    number;
    reason:    string;
    note:      string | null;
    createdAt: string;
  }>;
}

/* ── Wallet buttons ── */
function WalletButtons() {
  const [appleLoading,  setAppleLoading]  = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [modal, setModal] = useState<'apple' | 'google' | null>(null);

  const addApple = async () => {
    setAppleLoading(true);
    try {
      const res = await fetch('/api/wallet/apple');
      if (res.status === 501) { setModal('apple'); return; }
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = 'scruffs-loyalty.pkpass';
      a.click();
      URL.revokeObjectURL(url);
    } catch { setModal('apple'); }
    finally  { setAppleLoading(false); }
  };

  const addGoogle = async () => {
    setGoogleLoading(true);
    try {
      const res = await fetch('/api/wallet/google', { redirect: 'manual' });
      if (res.status === 501 || res.status === 500) { setModal('google'); return; }
      // Follow the redirect to Google Wallet save page
      window.location.href = '/api/wallet/google';
    } catch { setModal('google'); }
    finally  { setGoogleLoading(false); }
  };

  return (
    <>
      {/* Wallet buttons */}
      <div className="space-y-2.5">
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Save to Wallet</p>

        {/* Apple Wallet */}
        <button
          onClick={addApple}
          disabled={appleLoading}
          className="w-full flex items-center gap-3 bg-black text-white rounded-2xl px-4 py-3.5 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
          <div className="flex-1 text-left">
            <p className="text-[10px] font-semibold opacity-60 leading-none mb-0.5">Add to</p>
            <p className="font-bold text-sm leading-none">Apple Wallet</p>
          </div>
          {appleLoading && <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
        </button>

        {/* Google Wallet */}
        <button
          onClick={addGoogle}
          disabled={googleLoading}
          className="w-full flex items-center gap-3 bg-white border-2 border-[#4285F4] rounded-2xl px-4 py-3.5 hover:bg-blue-50 transition-colors disabled:opacity-50"
        >
          <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <div className="flex-1 text-left">
            <p className="text-[10px] font-semibold text-[#4285F4]/60 leading-none mb-0.5">Add to</p>
            <p className="font-bold text-sm text-[#4285F4] leading-none">Google Wallet</p>
          </div>
          {googleLoading && <div className="w-4 h-4 rounded-full border-2 border-blue-200 border-t-[#4285F4] animate-spin" />}
        </button>
      </div>

      {/* Setup modal — Apple */}
      {modal === 'apple' && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center p-4">
          <div className="bg-card rounded-3xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center">
                  <Wallet size={18} className="text-white" />
                </div>
                <p className="font-bold text-foreground text-base">Apple Wallet Setup</p>
              </div>
              <button onClick={() => setModal(null)}><X size={20} className="text-muted-foreground" /></button>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To enable Apple Wallet passes, you need an Apple Developer account. Here&apos;s the one-time setup:
            </p>
            <ol className="space-y-3">
              {[
                { step: '1', text: 'Sign up at developer.apple.com ($99/year)' },
                { step: '2', text: 'Go to Certificates, IDs & Profiles → Identifiers → + → Pass Type IDs' },
                { step: '3', text: 'Create ID: pass.ae.scruffs.loyalty' },
                { step: '4', text: 'Create a Pass Type ID Certificate → download .cer → export as PEM' },
                { step: '5', text: 'Add to Vercel: APPLE_PASS_CERT_PEM, APPLE_PASS_KEY_PEM, APPLE_PASS_TYPE_ID, APPLE_TEAM_ID' },
              ].map(({ step, text }) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{step}</span>
                  <p className="text-sm text-foreground">{text}</p>
                </li>
              ))}
            </ol>
            <p className="text-xs text-muted-foreground bg-secondary rounded-xl p-3">
              Once configured, customers tap the button and the loyalty card downloads directly to their iPhone Wallet — no app needed.
            </p>
            <button onClick={() => setModal(null)} className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold text-sm">
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Setup modal — Google */}
      {modal === 'google' && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center p-4">
          <div className="bg-card rounded-3xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#4285F4] flex items-center justify-center">
                  <Wallet size={18} className="text-white" />
                </div>
                <p className="font-bold text-foreground text-base">Google Wallet Setup</p>
              </div>
              <button onClick={() => setModal(null)}><X size={20} className="text-muted-foreground" /></button>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To enable Google Wallet passes (free):
            </p>
            <ol className="space-y-3">
              {[
                { step: '1', text: 'Go to pay.google.com/business/console → Request API access' },
                { step: '2', text: 'Create a Google Cloud project → Enable "Google Wallet API"' },
                { step: '3', text: 'Create a Service Account → generate a JSON key' },
                { step: '4', text: 'Add to Vercel: GOOGLE_WALLET_ISSUER_ID, GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL, GOOGLE_WALLET_PRIVATE_KEY' },
              ].map(({ step, text }) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#4285F4] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{step}</span>
                  <p className="text-sm text-foreground">{text}</p>
                </li>
              ))}
            </ol>
            <p className="text-xs text-muted-foreground bg-secondary rounded-xl p-3">
              Works on all Android phones. The card appears in Google Wallet and updates automatically when points change.
            </p>
            <button onClick={() => setModal(null)} className="w-full bg-[#4285F4] text-white py-3 rounded-xl font-bold text-sm">
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}

const REASON_LABELS: Record<string, string> = {
  BOOKING_EARN: 'Grooming session',
  SIGNUP_BONUS: 'Welcome bonus',
  ADMIN_AWARD:  'Bonus points',
  ADMIN_DEDUCT: 'Adjustment',
  REDEMPTION:   'Points redeemed',
};

const TIER_BENEFITS = [
  { tier: 'BRONZE', perks: ['Earn 1 pt per AED spent', 'Free paw wipe on every visit'] },
  { tier: 'SILVER', perks: ['Everything in Bronze', '5% off every booking', 'Priority WhatsApp support'] },
  { tier: 'GOLD',   perks: ['Everything in Silver', '10% off every booking', 'Priority scheduling', 'Free add-on once a month'] },
];

/* ── Paw print SVG (matches the physical card stamp style) ── */
function PawIcon({ filled, bg, fg }: { filled: boolean; bg: string; fg: string }) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      {/* Circle background */}
      <circle cx="50" cy="50" r="48" fill={bg} />
      {/* Toe beans */}
      <ellipse cx="30" cy="30" rx="9" ry="10" fill={filled ? fg : 'none'} stroke={fg} strokeWidth={filled ? 0 : 3.5} />
      <ellipse cx="45" cy="20" rx="9" ry="10" fill={filled ? fg : 'none'} stroke={fg} strokeWidth={filled ? 0 : 3.5} />
      <ellipse cx="60" cy="20" rx="9" ry="10" fill={filled ? fg : 'none'} stroke={fg} strokeWidth={filled ? 0 : 3.5} />
      <ellipse cx="75" cy="30" rx="9" ry="10" fill={filled ? fg : 'none'} stroke={fg} strokeWidth={filled ? 0 : 3.5} />
      {/* Main pad */}
      <ellipse cx="52" cy="62" rx="22" ry="20" fill={filled ? fg : 'none'} stroke={fg} strokeWidth={filled ? 0 : 3.5} />
    </svg>
  );
}

/* ── The two-sided flip card ── */
function LoyaltyFlipCard({ data }: { data: LoyaltyData }) {
  const [flipped, setFlipped] = useState(false);

  // Stamp logic: 12 grid positions (0=dog logo, 1-10=paw stamps, 11=FREE)
  // Each booking fills one paw stamp. After 10 bookings, FREE is unlocked.
  const stampsInCycle = data.bookingCount % 11; // cycles every 11 (10 stamps + 1 free)
  const completedCycles = Math.floor(data.bookingCount / 11);
  const pawsFilled = stampsInCycle; // 0-10 paws filled in current cycle
  const freeUnlocked = stampsInCycle === 0 && data.bookingCount > 0; // just completed a cycle

  const displayName = data.name ?? data.phone ?? data.email ?? 'Valued Member';

  return (
    <div className="w-full px-1">
      {/* Flip container */}
      <div
        className="relative w-full cursor-pointer"
        style={{ aspectRatio: '1.586', perspective: '1200px' }}
        onClick={() => setFlipped(!flipped)}
      >
        <div
          className="relative w-full h-full transition-transform duration-700"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* ══ FRONT FACE — dark green branded side ══ */}
          <div
            className="absolute inset-0 rounded-[20px] overflow-hidden flex flex-col items-center justify-center"
            style={{ backfaceVisibility: 'hidden', backgroundColor: '#3A4F4A' }}
          >
            {/* Subtle texture lines */}
            <div className="absolute inset-0 opacity-[0.04]" style={{
              backgroundImage: 'repeating-linear-gradient(45deg, #DBD4C7 0, #DBD4C7 1px, transparent 0, transparent 50%)',
              backgroundSize: '12px 12px',
            }} />

            <div className="relative z-10 flex flex-col items-center text-center px-6">
              {/* Logo */}
              <Image
                src="/logo-icon-beige.png"
                alt="Scruffs"
                width={70}
                height={70}
                className="mb-3"
                style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' }}
              />

              {/* EST 2022 */}
              <p style={{ color: '#DBD4C7', fontSize: '10px', letterSpacing: '0.35em', fontWeight: 600, marginBottom: '4px' }}>
                EST &nbsp;&nbsp;&nbsp; 2022
              </p>

              {/* SCRUFFS wordmark */}
              <h1 style={{
                color: '#DBD4C7',
                fontSize: 'clamp(28px, 9vw, 42px)',
                fontWeight: 900,
                letterSpacing: '0.22em',
                lineHeight: 1,
                marginBottom: '6px',
              }}>
                SCRUFFS
              </h1>

              {/* Tagline */}
              <p style={{
                color: '#DBD4C7',
                fontSize: '8px',
                letterSpacing: '0.28em',
                fontWeight: 600,
                opacity: 0.7,
              }}>
                EXTRAORDINARY PET GROOMERS
              </p>
            </div>

            {/* Flip hint */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1 opacity-30">
              <RotateCcw size={10} color="#DBD4C7" strokeWidth={2} />
              <span style={{ color: '#DBD4C7', fontSize: '8px', letterSpacing: '0.1em' }}>FLIP</span>
            </div>
          </div>

          {/* ══ BACK FACE — beige stamp card side ══ */}
          <div
            className="absolute inset-0 rounded-[20px] overflow-hidden flex"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', backgroundColor: '#DBD4C7' }}
          >
            {/* Main stamp grid area */}
            <div className="flex-1 p-4 flex flex-col justify-between">
              {/* 3×4 grid */}
              <div className="grid grid-cols-4 gap-2 flex-1">
                {/* Position 0: Scruffs dog logo cell */}
                <div
                  className="rounded-xl flex items-center justify-center p-1"
                  style={{ backgroundColor: '#3A4F4A' }}
                >
                  <Image
                    src="/logo-icon-beige.png"
                    alt="Scruffs"
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>

                {/* Positions 1–10: paw stamp circles */}
                {Array.from({ length: 10 }, (_, i) => {
                  const filled = i < pawsFilled || freeUnlocked;
                  return (
                    <div key={i} className="rounded-xl overflow-hidden flex items-center justify-center">
                      <div className="w-full h-full p-1">
                        <PawIcon
                          filled={filled}
                          bg="#3A4F4A"
                          fg="#DBD4C7"
                        />
                      </div>
                    </div>
                  );
                })}

                {/* Position 11: FREE cell */}
                <div
                  className="rounded-xl flex items-center justify-center"
                  style={{
                    backgroundColor: '#3A4F4A',
                    opacity: (pawsFilled >= 10 || freeUnlocked) ? 1 : 0.5,
                  }}
                >
                  <span style={{
                    color: '#DBD4C7',
                    fontSize: 'clamp(9px, 2.5vw, 13px)',
                    fontWeight: 900,
                    letterSpacing: '0.08em',
                  }}>
                    FREE
                  </span>
                </div>
              </div>

              {/* Member name + progress at bottom */}
              <div className="mt-2 flex items-end justify-between">
                <div>
                  <p style={{ color: '#3A4F4A', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', opacity: 0.6 }}>
                    MEMBER
                  </p>
                  <p style={{ color: '#3A4F4A', fontSize: '11px', fontWeight: 800, letterSpacing: '0.06em' }}>
                    {displayName.toUpperCase()}
                  </p>
                </div>
                <p style={{ color: '#3A4F4A', fontSize: '9px', fontWeight: 600, opacity: 0.5, letterSpacing: '0.06em' }}>
                  {pawsFilled}/10 · Cycle {completedCycles + 1}
                </p>
              </div>
            </div>

            {/* Vertical text strip on right — "EXTRAORDINARY PET GROOMERS" */}
            <div
              className="w-7 flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#3A4F4A' }}
            >
              <p
                style={{
                  color: '#DBD4C7',
                  fontSize: '7px',
                  letterSpacing: '0.22em',
                  fontWeight: 700,
                  writingMode: 'vertical-rl',
                  textOrientation: 'mixed',
                  transform: 'rotate(180deg)',
                  whiteSpace: 'nowrap',
                }}
              >
                EXTRAORDINARY PET GROOMERS
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tap instruction + cycle info */}
      <div className="flex items-center justify-between mt-2.5 px-1">
        <p className="text-[11px] text-muted-foreground">Tap card to flip · Show QR to groomer</p>
        {completedCycles > 0 && (
          <p className="text-[11px] font-bold text-primary">{completedCycles} free groom{completedCycles > 1 ? 's' : ''} earned</p>
        )}
      </div>
    </div>
  );
}

export default function LoyaltyPage() {
  const [data,    setData]    = useState<LoyaltyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    fetch('/api/loyalty/me')
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setData)
      .catch(() => setError('Log in to view your loyalty card'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-6 pb-28">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Star size={28} className="text-primary" strokeWidth={2} />
        </div>
        <p className="font-bold text-foreground text-xl">Loyalty Rewards</p>
        <p className="text-muted-foreground text-sm text-center">{error}</p>
        <Link href="/auth" className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold text-sm">
          Log In to View Card
        </Link>
      </div>
    );
  }

  const tier    = data.tier as 'BRONZE' | 'SILVER' | 'GOLD';
  const tierDef = LOYALTY_TIERS[tier];
  const { pointsToNext, nextTier } = loyaltyProgress(data.points);
  const sessionsToFree = 10 - (data.bookingCount % 11 === 0 && data.bookingCount > 0 ? 10 : data.bookingCount % 11);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3 flex items-center gap-3 sticky top-0 z-30">
        <Link href="/" className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center">
          <ArrowLeft size={16} className="text-foreground" strokeWidth={2.5} />
        </Link>
        <Image src="/logo-icon-green.png" alt="Scruffs" width={30} height={30} className="rounded-xl" />
        <span className="font-black text-sm tracking-[0.15em] text-foreground">SCRUFFS</span>
        <span className="ml-auto text-xs font-bold text-primary">Loyalty Rewards</span>
      </div>

      <main className="flex-1 overflow-y-auto pb-28">
        <div className="max-w-lg mx-auto px-4 pt-6 space-y-5">

          {/* ── THE PHYSICAL CARD ── */}
          <LoyaltyFlipCard data={data} />

          {/* ── ADD TO WALLET ── */}
          <WalletButtons />

          {/* ── STAMP PROGRESS CARD ── */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-4 py-3.5 border-b border-border">
              <div className="flex items-center justify-between">
                <p className="font-bold text-foreground text-sm">Stamp Progress</p>
                <span className="text-[11px] font-bold text-primary">
                  {data.bookingCount % 11 === 0 && data.bookingCount > 0 ? '10/10 — Claim your FREE!' : `${data.bookingCount % 11}/10`}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {sessionsToFree > 0
                  ? `${sessionsToFree} more session${sessionsToFree > 1 ? 's' : ''} until your FREE groom`
                  : 'You\'ve earned a FREE groom! Show your card to claim it'}
              </p>
            </div>
            {/* Progress dots */}
            <div className="px-4 py-3 flex gap-1.5 flex-wrap">
              {Array.from({ length: 10 }, (_, i) => {
                const filled = i < (data.bookingCount % 11 === 0 && data.bookingCount > 0 ? 10 : data.bookingCount % 11);
                return (
                  <div
                    key={i}
                    className={`w-7 h-7 rounded-full flex items-center justify-center ${filled ? 'bg-primary' : 'bg-secondary border-2 border-border'}`}
                  >
                    {filled && (
                      <svg viewBox="0 0 20 20" width="14" height="14" fill="#DBD4C7">
                        <ellipse cx="6" cy="6" rx="2" ry="2.2" />
                        <ellipse cx="10" cy="4" rx="2" ry="2.2" />
                        <ellipse cx="14" cy="6" rx="2" ry="2.2" />
                        <ellipse cx="10.5" cy="13" rx="4.5" ry="4" />
                      </svg>
                    )}
                  </div>
                );
              })}
              {/* FREE slot */}
              <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                (data.bookingCount % 11 === 0 && data.bookingCount > 0) ? 'bg-amber-500' : 'bg-secondary border-2 border-border'
              }`}>
                <span className="text-[7px] font-black text-white">FREE</span>
              </div>
            </div>
          </div>

          {/* ── POINTS BALANCE ── */}
          <div className="bg-card border border-border rounded-2xl px-4 py-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Points Balance</p>
              <p className="font-black text-3xl text-foreground mt-0.5">{data.points.toLocaleString()} <span className="text-base font-bold text-muted-foreground">pts</span></p>
              {nextTier && <p className="text-[11px] text-muted-foreground mt-0.5">{pointsToNext} pts to {nextTier}</p>}
            </div>
            <div className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider ${
              tier === 'GOLD'   ? 'bg-yellow-500/15 text-yellow-600' :
              tier === 'SILVER' ? 'bg-gray-400/15 text-gray-500'     : 'bg-amber-700/15 text-amber-700'
            }`}>
              {tierDef.label}
            </div>
          </div>

          {/* ── CURRENT BENEFITS ── */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-4 py-3.5 border-b border-border flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <Gift size={14} className="text-primary" strokeWidth={2} />
              </div>
              <p className="font-bold text-foreground text-sm">{tierDef.label} Benefits</p>
            </div>
            <div className="px-4 py-3 space-y-2.5">
              {(TIER_BENEFITS.find((t) => t.tier === tier)?.perks ?? []).map((perk) => (
                <div key={perk} className="flex items-center gap-2.5">
                  <Star size={11} className="text-primary fill-primary flex-shrink-0" />
                  <p className="text-sm text-foreground">{perk}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── POINTS HISTORY ── */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-4 py-3.5 border-b border-border flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp size={14} className="text-primary" strokeWidth={2} />
              </div>
              <p className="font-bold text-foreground text-sm">Points History</p>
            </div>

            {data.transactions.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Clock size={24} className="text-muted-foreground mx-auto mb-2" strokeWidth={1.5} />
                <p className="text-sm text-muted-foreground">No transactions yet</p>
                <p className="text-xs text-muted-foreground mt-0.5">Book a session to start earning!</p>
              </div>
            ) : (
              data.transactions.map((tx, i) => (
                <div key={tx.id} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? 'border-t border-border' : ''}`}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-black ${
                    tx.points > 0 ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'
                  }`}>
                    {tx.points > 0 ? '+' : '−'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{REASON_LABELS[tx.reason] ?? tx.reason}</p>
                    {tx.note && <p className="text-[11px] text-muted-foreground truncate">{tx.note}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`font-bold text-sm ${tx.points > 0 ? 'text-primary' : 'text-destructive'}`}>
                      {tx.points > 0 ? '+' : ''}{tx.points} pts
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(tx.createdAt).toLocaleDateString('en-AE', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ── BOOK CTA ── */}
          <Link
            href="/book"
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 rounded-2xl font-bold text-sm hover:opacity-90 transition-opacity"
          >
            Book Now &amp; Earn Stamps <ChevronRight size={15} strokeWidth={2.5} />
          </Link>

        </div>
      </main>

      <BottomNav />
    </div>
  );
}
