'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Star, Gift, TrendingUp, Clock, ChevronRight, RotateCcw } from 'lucide-react';
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
