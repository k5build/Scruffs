'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, Clock, MapPin, ChevronRight, CalendarX } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

interface LocalBooking {
  id: string;
  bookingRef: string;
  petName: string;
  service: string;
  slotDate: string;
  slotStartTime: string;
  area: string;
  price: number;
  status: string;
}

function StatusBadge({ s }: { s: string }) {
  const map: Record<string, string> = {
    CONFIRMED:   'bg-primary/15 text-primary',
    IN_PROGRESS: 'bg-blue-500/15 text-blue-400',
    COMPLETED:   'bg-secondary text-muted-foreground',
    CANCELLED:   'bg-destructive/15 text-destructive',
  };
  const cls = map[s] ?? 'bg-secondary text-muted-foreground';
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${cls}`}>
      {s.charAt(0) + s.slice(1).toLowerCase()}
    </span>
  );
}

function fmtDate(d: string) {
  try { return new Date(d).toLocaleDateString('en-AE', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return d; }
}

function fmtTime(t: string) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hour}:${m.toString().padStart(2, '0')} ${suffix}`;
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<LocalBooking[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('scruffs_bookings');
      if (raw) setBookings(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-card border-b border-border px-4 py-3.5 flex items-center gap-3 sticky top-0 z-30">
        <Link href="/" className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={17} strokeWidth={2.5} />
        </Link>
        <p className="font-bold text-foreground text-base">My Bookings</p>
      </div>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-5 pb-28 space-y-3">

        {bookings.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-2xl p-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <CalendarX size={28} className="text-primary/60" strokeWidth={1.5} />
            </div>
            <p className="font-bold text-foreground text-base">No bookings yet</p>
            <p className="text-xs text-muted-foreground mt-1 mb-6">
              Your upcoming appointments will appear here
            </p>
            <Link
              href="/book"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
            >
              Book Now
            </Link>
          </div>
        ) : (
          <>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest px-0.5">
              {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'}
            </p>

            {bookings.map((b) => (
              <Link key={b.id} href={`/booking/${b.id}`}>
                <div className="bg-card border border-border rounded-2xl px-4 py-4 hover:border-primary/30 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-bold text-foreground text-sm">{b.petName}</p>
                        <span className="text-[10px] font-mono text-muted-foreground">{b.bookingRef}</span>
                      </div>
                      <p className="text-xs font-medium text-foreground">Wash & Tidy</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <StatusBadge s={b.status} />
                      <ChevronRight size={14} className="text-muted-foreground" strokeWidth={2} />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <CalendarDays size={11} strokeWidth={2} /> {fmtDate(b.slotDate)}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock size={11} strokeWidth={2} /> ~{fmtTime(b.slotStartTime)}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <MapPin size={11} strokeWidth={2} /> {b.area}
                    </span>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Total · pay on day</span>
                    <span className="font-bold text-foreground text-sm">AED {b.price}</span>
                  </div>
                </div>
              </Link>
            ))}
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
