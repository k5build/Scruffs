import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CalendarDays, Clock, MapPin, PawPrint, Scissors, Check, ChevronRight, AlertCircle } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { formatDate, formatTime, formatDuration, formatPrice, addMinutesToTime, buildBookingWhatsApp, BASE_SERVICE, ADDONS } from '@/lib/utils';

export const metadata: Metadata = { title: 'Booking Confirmed – Scruffs.ae' };

interface Props { params: { id: string } }

export default async function BookingConfirmationPage({ params }: Props) {
  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: { slot: true },
  });

  if (!booking) notFound();

  const bookingAddons = (() => { try { return JSON.parse(booking.addons ?? '[]') as string[]; } catch { return []; } })();
  const estimatedEnd  = addMinutesToTime(booking.slot.startTime, booking.duration);
  const waUrl         = buildBookingWhatsApp({
    bookingRef: booking.bookingRef, petName: booking.petName, petBreed: booking.petBreed,
    petSize: booking.petSize, service: booking.service, price: booking.price,
    slotDate: booking.slot.date, slotStartTime: booking.slot.startTime,
    area: booking.area, address: booking.address, ownerName: booking.ownerName,
    ownerPhone: booking.ownerPhone, duration: booking.duration,
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image src="/logo-icon-green.png" alt="Scruffs" width={30} height={30} className="rounded-lg" />
          <span className="font-bold text-foreground text-sm tracking-widest">SCRUFFS</span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/15 text-primary px-3 py-1 rounded-full">Confirmed</span>
        <div className="w-20" />
      </div>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6 space-y-5 pb-10">

        {/* Success */}
        <div className="text-center py-5">
          <div className="success-ring mx-auto mb-4">
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
              <Check size={26} strokeWidth={3} className="text-primary-foreground" />
            </div>
          </div>
          <h1 className="font-bold text-2xl text-foreground">All booked!</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {booking.petName} is in for a treat. See you soon!
          </p>
        </div>

        {/* Ref */}
        <div className="bg-card border border-border rounded-2xl px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Booking Reference</p>
            <p className="font-mono font-bold text-foreground text-lg tracking-wider mt-0.5">{booking.bookingRef}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <Check size={17} strokeWidth={2.5} className="text-primary" />
          </div>
        </div>

        {/* Time window notice */}
        <div className="bg-primary/8 border border-primary/20 rounded-2xl px-4 py-3.5 flex items-start gap-3">
          <AlertCircle size={15} className="text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
          <p className="text-[12px] text-foreground leading-relaxed">
            Your selected time is a <strong>preferred window</strong>. Our groomer will WhatsApp you <strong>30 min before arrival</strong> to confirm the exact time.
          </p>
        </div>

        {/* Summary */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="bg-primary px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PawPrint size={14} className="text-primary-foreground/80" strokeWidth={2} />
              <span className="text-primary-foreground font-bold text-sm">{booking.petName}</span>
              <span className="text-primary-foreground/60 text-xs">· {booking.petBreed}</span>
            </div>
            <span className="font-bold text-primary-foreground">{formatPrice(booking.price)}</span>
          </div>

          <div>
            <ConfirmRow icon={<Scissors size={14} className="text-primary" strokeWidth={2} />} label="Service" value={BASE_SERVICE.name}
              sub={[`~${formatDuration(booking.duration)}`, bookingAddons.length > 0 ? bookingAddons.map((k) => ADDONS.find((a) => a.key === k)?.label ?? k).join(', ') : null].filter(Boolean).join(' · ')} />
            <ConfirmRow icon={<CalendarDays size={14} className="text-primary" strokeWidth={2} />} label="Date" value={formatDate(booking.slot.date)} />
            <ConfirmRow icon={<Clock size={14} className="text-primary" strokeWidth={2} />} label="Time Window" value={`${formatTime(booking.slot.startTime)} → ~${formatTime(estimatedEnd)}`} sub="Exact arrival confirmed by WhatsApp" />
            <ConfirmRow icon={<MapPin size={14} className="text-primary" strokeWidth={2} />} label="Location" value={booking.area} sub={[booking.address, booking.buildingNote].filter(Boolean).join(', ')} />
          </div>

          <div className="bg-secondary/40 px-5 py-3 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Total +VAT · pay on day</span>
              <span className="font-bold text-foreground text-lg">{formatPrice(booking.price)}</span>
            </div>
          </div>
        </div>

        {/* What's next */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3">What&apos;s Next?</p>
          <ul className="space-y-2.5">
            {[
              'Booking confirmed — no deposit needed',
              'Groomer will WhatsApp you 30 min before arrival',
              'Mobile salon van arrives at your door',
              'Pay cash or card on the day',
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={11} strokeWidth={3} className="text-primary" />
                </div>
                <p className="text-sm text-foreground">{text}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-3 bg-[#25D366] text-white py-4 rounded-2xl font-bold text-sm hover:opacity-90 transition-opacity"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Send via WhatsApp
          </a>

          <Link
            href="/my-bookings"
            className="w-full flex items-center justify-center gap-2 bg-card border border-border text-foreground py-3.5 rounded-2xl font-bold text-sm hover:border-primary/30 transition-colors"
          >
            View My Bookings <ChevronRight size={15} />
          </Link>

          <Link href="/" className="w-full flex items-center justify-center text-sm font-medium text-muted-foreground hover:text-foreground py-2 transition-colors">
            Back to Home
          </Link>
        </div>

      </main>
    </div>
  );
}

function ConfirmRow({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-start gap-3 px-5 py-3 border-b border-border last:border-0">
      <div className="mt-0.5 flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="font-semibold text-sm text-foreground mt-0.5">{value}</p>
        {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
