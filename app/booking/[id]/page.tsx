import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CalendarDays, Clock, MapPin, PawPrint, Scissors, Check, ChevronRight } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { formatDate, formatTime, formatDuration, formatPrice, addMinutesToTime, buildBookingWhatsApp, SERVICES } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Booking Confirmed – Scruffs.ae',
};

interface Props {
  params: { id: string };
}

export default async function BookingConfirmationPage({ params }: Props) {
  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: { slot: true },
  });

  if (!booking) notFound();

  const svc          = SERVICES[booking.service as keyof typeof SERVICES];
  const estimatedEnd = addMinutesToTime(booking.slot.startTime, booking.duration);
  const waUrl        = buildBookingWhatsApp({
    bookingRef:    booking.bookingRef,
    petName:       booking.petName,
    petBreed:      booking.petBreed,
    petSize:       booking.petSize,
    service:       booking.service,
    price:         booking.price,
    slotDate:      booking.slot.date,
    slotStartTime: booking.slot.startTime,
    area:          booking.area,
    address:       booking.address,
    ownerName:     booking.ownerName,
    ownerPhone:    booking.ownerPhone,
    duration:      booking.duration,
  });

  return (
    <div className="min-h-screen bg-scruffs-light flex flex-col">
      {/* Top bar */}
      <div className="bg-scruffs-dark px-4 py-3 flex items-center justify-between">
        <Image src="/logo-icon-beige.png" alt="Scruffs" width={32} height={32} className="rounded-full opacity-80" />
        <p className="text-scruffs-beige/70 text-xs font-display font-bold uppercase tracking-widest">Booking Confirmed</p>
        <div className="w-8" />
      </div>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6 space-y-5">

        {/* ── Success badge ── */}
        <div className="text-center py-4">
          <div className="w-20 h-20 rounded-full bg-scruffs-teal/20 flex items-center justify-center mx-auto mb-4">
            <div className="w-14 h-14 rounded-full bg-scruffs-teal flex items-center justify-center">
              <Check size={28} strokeWidth={3} className="text-scruffs-dark" />
            </div>
          </div>
          <h1 className="font-display font-extrabold text-2xl text-scruffs-dark">All booked!</h1>
          <p className="text-scruffs-muted text-sm mt-1">
            {booking.petName} is in for a treat. See you soon!
          </p>
        </div>

        {/* ── Booking ref ── */}
        <div className="card bg-scruffs-beige/50 px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-scruffs-muted uppercase tracking-wider">Booking Reference</p>
            <p className="font-mono font-bold text-scruffs-dark text-lg tracking-wider mt-0.5">
              {booking.bookingRef}
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-scruffs-teal/20 flex items-center justify-center">
            <Check size={18} strokeWidth={2.5} className="text-scruffs-teal-dark" />
          </div>
        </div>

        {/* ── Booking summary card ── */}
        <div className="card overflow-hidden">
          <div className="bg-scruffs-dark px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PawPrint size={15} className="text-scruffs-teal" strokeWidth={2} />
              <span className="text-scruffs-beige font-display font-bold text-sm">{booking.petName}</span>
              <span className="text-scruffs-beige/50 text-xs">· {booking.petBreed}</span>
            </div>
            <span className="font-display font-extrabold text-scruffs-beige">{formatPrice(booking.price)}</span>
          </div>

          <div className="divide-y divide-scruffs-border">
            <ConfirmRow
              icon={<Scissors size={14} strokeWidth={2} className="text-scruffs-teal-dark" />}
              label="Service"
              value={svc?.name ?? booking.service}
              sub={`~${formatDuration(booking.duration)}`}
            />
            <ConfirmRow
              icon={<CalendarDays size={14} strokeWidth={2} className="text-scruffs-teal-dark" />}
              label="Date"
              value={formatDate(booking.slot.date)}
            />
            <ConfirmRow
              icon={<Clock size={14} strokeWidth={2} className="text-scruffs-teal-dark" />}
              label="Time"
              value={`${formatTime(booking.slot.startTime)} → ~${formatTime(estimatedEnd)}`}
            />
            <ConfirmRow
              icon={<MapPin size={14} strokeWidth={2} className="text-scruffs-teal-dark" />}
              label="Location"
              value={booking.area}
              sub={[booking.address, booking.buildingNote].filter(Boolean).join(', ')}
            />
          </div>
        </div>

        {/* ── What's next ── */}
        <div className="card p-4">
          <p className="text-xs font-display font-bold text-scruffs-dark uppercase tracking-wide mb-3">What&apos;s Next?</p>
          <ul className="space-y-2.5">
            {[
              { text: 'Your booking is confirmed — no deposit needed' },
              { text: 'Our groomer will WhatsApp you 30 min before arrival' },
              { text: 'Mobile salon van arrives at your door' },
              { text: 'Pay cash or card on the day' },
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full bg-scruffs-teal/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={10} strokeWidth={3} className="text-scruffs-teal-dark" />
                </div>
                <p className="text-[12px] text-scruffs-dark">{item.text}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Actions ── */}
        <div className="space-y-3 pb-4">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-3 bg-[#25D366] text-white py-4 rounded-2xl font-display font-bold text-sm shadow-brand-md hover:bg-[#22c55e] transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Send via WhatsApp
          </a>

          <Link
            href="/my-bookings"
            className="w-full flex items-center justify-center gap-2 bg-scruffs-beige text-scruffs-dark py-3.5 rounded-2xl font-display font-bold text-sm hover:bg-scruffs-beige/80 transition-colors"
          >
            View My Bookings <ChevronRight size={15} strokeWidth={2.5} />
          </Link>

          <Link
            href="/"
            className="w-full flex items-center justify-center py-3 text-scruffs-muted text-sm font-semibold hover:text-scruffs-dark transition-colors"
          >
            Back to Home
          </Link>
        </div>

        {/* ── Instagram CTA ── */}
        <div className="card p-4 flex items-center justify-between border-l-4 border-pink-400">
          <div>
            <p className="font-bold text-scruffs-dark text-sm">Follow us on Instagram</p>
            <p className="text-xs text-scruffs-muted">Before & afters, tips & offers</p>
          </div>
          <a
            href="https://instagram.com/scruffs.ae"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl text-xs font-display font-bold"
          >
            @scruffs.ae
          </a>
        </div>

      </main>
    </div>
  );
}

function ConfirmRow({
  icon, label, value, sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <div className="mt-0.5 flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-scruffs-muted uppercase tracking-wide">{label}</p>
        <p className="font-semibold text-sm text-scruffs-dark mt-0.5">{value}</p>
        {sub && <p className="text-[11px] text-scruffs-muted mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
