import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CalendarDays, Clock, MapPin, PawPrint, Scissors, Check, ChevronRight } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { formatDate, formatTime, formatDuration, formatPrice, addMinutesToTime, buildBookingWhatsApp, BASE_SERVICE, ADDONS } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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

  const bookingAddons = (() => { try { return JSON.parse(booking.addons ?? '[]') as string[]; } catch { return []; } })();
  const estimatedEnd  = addMinutesToTime(booking.slot.startTime, booking.duration);
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-primary px-4 py-3.5 flex items-center justify-between">
        <Image src="/logo-icon-beige.png" alt="Scruffs" width={30} height={30} className="rounded-full opacity-80" />
        <Badge variant="teal" className="text-[10px] tracking-widest uppercase">Booking Confirmed</Badge>
        <div className="w-8" />
      </div>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6 space-y-5 pb-10">

        {/* Success */}
        <div className="text-center py-5">
          <div className="success-ring mx-auto mb-4">
            <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center">
              <Check size={26} strokeWidth={3} className="text-accent-foreground" />
            </div>
          </div>
          <h1 className="font-display font-extrabold text-2xl text-foreground">All booked!</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {booking.petName} is in for a treat. See you soon!
          </p>
        </div>

        {/* Booking ref */}
        <Card className="px-5 py-4 flex items-center justify-between bg-secondary/50 shadow-brand-sm">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Booking Reference</p>
            <p className="font-mono font-bold text-foreground text-lg tracking-wider mt-0.5">
              {booking.bookingRef}
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center">
            <Check size={17} strokeWidth={2.5} className="text-accent-foreground" />
          </div>
        </Card>

        {/* Summary card */}
        <Card className="overflow-hidden shadow-brand-md">
          <div className="bg-primary px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PawPrint size={15} className="text-accent" strokeWidth={2} />
              <span className="text-primary-foreground font-display font-bold text-sm">{booking.petName}</span>
              <span className="text-primary-foreground/50 text-xs">· {booking.petBreed}</span>
            </div>
            <span className="font-display font-extrabold text-primary-foreground">{formatPrice(booking.price)}</span>
          </div>

          <div className="divide-y divide-border">
            <ConfirmRow
              icon={<Scissors size={14} className="text-accent-foreground" strokeWidth={2} />}
              label="Service"
              value={BASE_SERVICE.name}
              sub={[
                `~${formatDuration(booking.duration)}`,
                bookingAddons.length > 0
                  ? bookingAddons.map((k) => ADDONS.find((a) => a.key === k)?.label ?? k).join(', ')
                  : null,
              ].filter(Boolean).join(' · ')}
            />
            <ConfirmRow icon={<CalendarDays size={14} className="text-accent-foreground" strokeWidth={2} />} label="Date" value={formatDate(booking.slot.date)} />
            <ConfirmRow icon={<Clock size={14} className="text-accent-foreground" strokeWidth={2} />} label="Time" value={`${formatTime(booking.slot.startTime)} → ~${formatTime(estimatedEnd)}`} />
            <ConfirmRow icon={<MapPin size={14} className="text-accent-foreground" strokeWidth={2} />} label="Location" value={booking.area} sub={[booking.address, booking.buildingNote].filter(Boolean).join(', ')} />
          </div>
        </Card>

        {/* What's next */}
        <Card className="p-5 shadow-brand-sm">
          <p className="text-xs font-display font-bold text-foreground uppercase tracking-wide mb-3">What&apos;s Next?</p>
          <ul className="space-y-2.5">
            {[
              'Your booking is confirmed — no deposit needed',
              'Our groomer will WhatsApp you 30 min before arrival',
              'Mobile salon van arrives at your door',
              'Pay cash or card on the day',
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={10} strokeWidth={3} className="text-accent-foreground" />
                </div>
                <p className="text-[12px] text-foreground">{text}</p>
              </li>
            ))}
          </ul>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
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

          <Button asChild variant="secondary" className="w-full h-12 font-display font-bold">
            <Link href="/my-bookings">
              View My Bookings <ChevronRight size={15} />
            </Link>
          </Button>

          <Button asChild variant="ghost" className="w-full h-10 text-muted-foreground font-semibold">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>

        {/* Instagram CTA */}
        <Card className="p-4 flex items-center justify-between border-l-4 border-pink-400 shadow-none">
          <div>
            <p className="font-bold text-foreground text-sm">Follow us on Instagram</p>
            <p className="text-xs text-muted-foreground">Before & afters, tips & offers</p>
          </div>
          <a
            href="https://instagram.com/scruffs.ae"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-gradient-to-br from-pink-500 to-purple-500 text-white rounded-xl text-xs font-display font-bold shadow-sm hover:opacity-90 transition-opacity"
          >
            @scruffs.ae
          </a>
        </Card>

      </main>
    </div>
  );
}

function ConfirmRow({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-start gap-3 px-5 py-3">
      <div className="mt-0.5 flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="font-semibold text-sm text-foreground mt-0.5">{value}</p>
        {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
