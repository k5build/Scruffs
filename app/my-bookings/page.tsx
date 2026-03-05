'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, Clock, MapPin, ChevronRight, CalendarX } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

const SERVICE_LABELS: Record<string, string> = {
  BASIC:   'Bath & Brush',
  SPECIAL: 'Full Groom',
  FULL:    'Luxury Spa',
};

function statusBadge(s: string) {
  switch (s) {
    case 'CONFIRMED':   return <Badge variant="success">Confirmed</Badge>;
    case 'IN_PROGRESS': return <Badge variant="default">In Progress</Badge>;
    case 'COMPLETED':   return <Badge variant="secondary">Completed</Badge>;
    case 'CANCELLED':   return <Badge variant="destructive">Cancelled</Badge>;
    default:            return <Badge variant="secondary">{s}</Badge>;
  }
}

function formatDateShort(d: string) {
  try { return new Date(d).toLocaleDateString('en-AE', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return d; }
}

function formatTimeShort(t: string) {
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
      <div className="bg-primary px-4 py-3.5 flex items-center gap-3">
        <Link href="/" className="p-1.5 rounded-xl text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10 transition-colors">
          <ArrowLeft size={20} strokeWidth={2.5} />
        </Link>
        <div>
          <p className="text-primary-foreground/50 text-[10px] font-display font-bold uppercase tracking-widest">Scruffs</p>
          <p className="text-primary-foreground font-display font-bold text-sm">My Bookings</p>
        </div>
      </div>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-5 pb-28 space-y-3">

        {bookings.length === 0 ? (
          <Card className="p-10 text-center shadow-brand-sm border-dashed">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
              <CalendarX size={28} className="text-primary/60" strokeWidth={1.5} />
            </div>
            <p className="font-display font-bold text-foreground text-base">No bookings yet</p>
            <p className="text-xs text-muted-foreground mt-1 mb-6">
              Your upcoming appointments will appear here
            </p>
            <Button asChild size="sm" className="font-display font-bold">
              <Link href="/book">Book Now</Link>
            </Button>
          </Card>
        ) : (
          <>
            <p className="text-xs font-display font-bold text-muted-foreground uppercase tracking-wide px-0.5">
              {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'}
            </p>

            {bookings.map((b) => (
              <Link key={b.id} href={`/booking/${b.id}`}>
                <Card className="px-4 py-4 shadow-brand-sm hover:shadow-brand-md transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-display font-bold text-foreground text-sm">{b.petName}</p>
                        <span className="text-[10px] font-bold text-muted-foreground">{b.bookingRef}</span>
                      </div>
                      <p className="text-xs font-semibold text-foreground">
                        {SERVICE_LABELS[b.service] ?? b.service}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {statusBadge(b.status)}
                      <ChevronRight size={15} className="text-muted-foreground" strokeWidth={2} />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <CalendarDays size={11} strokeWidth={2} /> {formatDateShort(b.slotDate)}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock size={11} strokeWidth={2} /> {formatTimeShort(b.slotStartTime)}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <MapPin size={11} strokeWidth={2} /> {b.area}
                    </span>
                  </div>

                  <div className="mt-2.5 pt-2.5 border-t border-border flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Total</span>
                    <span className="font-display font-bold text-foreground text-sm">AED {b.price}</span>
                  </div>
                </Card>
              </Link>
            ))}
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
