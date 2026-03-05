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

// We store basic booking info in localStorage after confirmation for offline access.
// The full booking is always available at /booking/[id] via the server.

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<LocalBooking[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('scruffs_bookings');
      if (raw) setBookings(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const SERVICE_LABELS: Record<string, string> = {
    BASIC: 'Bath & Brush',
    SPECIAL: 'Full Groom',
    FULL: 'Luxury Spa',
  };

  const formatDateShort = (d: string) => {
    try {
      const date = new Date(d);
      return date.toLocaleDateString('en-AE', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return d; }
  };

  const formatTimeShort = (t: string) => {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${hour}:${m.toString().padStart(2, '0')} ${suffix}`;
  };

  const statusColor = (s: string) => {
    switch (s) {
      case 'CONFIRMED':    return 'text-green-700 bg-green-100';
      case 'IN_PROGRESS':  return 'text-blue-700 bg-blue-100';
      case 'COMPLETED':    return 'text-scruffs-muted bg-scruffs-beige';
      case 'CANCELLED':    return 'text-red-700 bg-red-100';
      default:             return 'text-scruffs-dark bg-scruffs-beige';
    }
  };

  return (
    <div className="min-h-screen bg-scruffs-light flex flex-col">
      <div className="bg-scruffs-dark px-4 py-3 flex items-center gap-3">
        <Link href="/" className="p-1.5 rounded-xl text-scruffs-beige hover:bg-white/10 transition-colors">
          <ArrowLeft size={20} strokeWidth={2.5} />
        </Link>
        <div>
          <p className="text-scruffs-beige/60 text-[10px] font-display font-bold uppercase tracking-wider">Scruffs</p>
          <p className="text-white font-display font-bold text-sm">My Bookings</p>
        </div>
      </div>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-5 pb-28 space-y-3">

        {bookings.length === 0 ? (
          <div className="card p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-scruffs-beige flex items-center justify-center mx-auto mb-4">
              <CalendarX size={28} className="text-scruffs-dark" strokeWidth={1.5} />
            </div>
            <p className="font-display font-bold text-scruffs-dark text-base">No bookings yet</p>
            <p className="text-xs text-scruffs-muted mt-1 mb-5">
              Your upcoming appointments will appear here
            </p>
            <Link
              href="/book"
              className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm font-display font-bold"
            >
              Book Now
            </Link>
          </div>
        ) : (
          <>
            <p className="text-xs font-display font-bold text-scruffs-muted uppercase tracking-wide">
              {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'}
            </p>

            {bookings.map((b) => (
              <Link
                key={b.id}
                href={`/booking/${b.id}`}
                className="card px-4 py-4 block card-hover"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-display font-bold text-scruffs-dark text-sm">{b.petName}</p>
                      <span className="text-[10px] font-bold text-scruffs-muted">{b.bookingRef}</span>
                    </div>
                    <p className="text-xs font-semibold text-scruffs-dark">
                      {SERVICE_LABELS[b.service] ?? b.service}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor(b.status)}`}>
                      {b.status}
                    </span>
                    <ChevronRight size={15} className="text-scruffs-muted" strokeWidth={2} />
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1 text-[11px] text-scruffs-muted">
                    <CalendarDays size={11} strokeWidth={2} /> {formatDateShort(b.slotDate)}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-scruffs-muted">
                    <Clock size={11} strokeWidth={2} /> {formatTimeShort(b.slotStartTime)}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-scruffs-muted">
                    <MapPin size={11} strokeWidth={2} /> {b.area}
                  </span>
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
