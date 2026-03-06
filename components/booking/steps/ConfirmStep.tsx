'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, Clock, MapPin, PawPrint, Scissors, User, Phone, Loader2 } from 'lucide-react';
import { BookingData } from '@/types';
import { SERVICES, formatDate, formatTime, formatDuration, formatPrice, addMinutesToTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  data: BookingData;
  onBack: () => void;
}

export default function ConfirmStep({ data, onBack }: Props) {
  const router = useRouter();
  const [ownerName,  setOwnerName]  = useState(data.ownerName  || '');
  const [ownerPhone, setOwnerPhone] = useState(data.ownerPhone || '');
  const [submitting, setSubmitting] = useState(false);
  const [errors,     setErrors]     = useState<Record<string, string>>({});
  const [apiError,   setApiError]   = useState('');

  const svc = data.service ? SERVICES[data.service] : null;
  const estimatedEnd = data.slotStartTime && data.duration
    ? addMinutesToTime(data.slotStartTime, data.duration)
    : data.slotEndTime;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!ownerName.trim())  e.ownerName  = 'Enter your name';
    if (!ownerPhone.trim()) e.ownerPhone = 'Enter your phone number';
    else {
      const digits = ownerPhone.replace(/\D/g, '');
      if (digits.length < 9) e.ownerPhone = 'Enter a valid UAE phone number';
    }
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSubmitting(true);
    setApiError('');
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          petType: data.petType, petName: data.petName, petBreed: data.petBreed,
          petAge: data.petAge, petSize: data.petSize ?? null, petNotes: data.petNotes || undefined,
          service: data.service, price: data.price, duration: data.duration,
          area: data.area, address: data.address, buildingNote: data.buildingNote || undefined,
          mapsLink: data.mapsLink || undefined, slotId: data.slotId,
          ownerName: ownerName.trim(), ownerPhone: ownerPhone.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok) { setApiError(json.error ?? 'Something went wrong. Please try again.'); return; }

      if (!data.savedPetId && data.petType && data.petName) {
        try {
          const raw  = localStorage.getItem('scruffs_pets');
          const pets = raw ? JSON.parse(raw) : [];
          const already = pets.find((p: { name: string; breed: string }) => p.name === data.petName && p.breed === data.petBreed);
          if (!already) {
            pets.unshift({ id: crypto.randomUUID(), name: data.petName, type: data.petType, breed: data.petBreed, size: data.petSize ?? null, age: data.petAge, notes: data.petNotes || '' });
            localStorage.setItem('scruffs_pets', JSON.stringify(pets.slice(0, 5)));
          }
        } catch { /* ignore */ }
      }

      try {
        const raw      = localStorage.getItem('scruffs_bookings');
        const bookings = raw ? JSON.parse(raw) : [];
        bookings.unshift({
          id: json.booking.id, bookingRef: json.booking.bookingRef, petName: data.petName,
          service: data.service, slotDate: data.slotDate, slotStartTime: data.slotStartTime,
          area: data.area, price: data.price, status: 'CONFIRMED',
        });
        localStorage.setItem('scruffs_bookings', JSON.stringify(bookings.slice(0, 20)));
      } catch { /* ignore */ }

      router.push(`/booking/${json.booking.id}`);
    } catch {
      setApiError('Network error. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-5 pb-28">
      <div>
        <h2 className="font-display font-extrabold text-2xl text-foreground">Review & Book</h2>
        <p className="text-muted-foreground text-sm mt-1">Check your details, then confirm your booking</p>
      </div>

      {/* Summary card */}
      <Card className="overflow-hidden shadow-brand-md">
        {/* Header */}
        <div className="bg-primary px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PawPrint size={15} className="text-accent" strokeWidth={2} />
            <span className="text-primary-foreground font-display font-bold text-sm">{data.petName}</span>
            <span className="text-primary-foreground/50 text-xs">· {data.petBreed}</span>
          </div>
          <span className="font-display font-extrabold text-primary-foreground text-base">{formatPrice(data.price)}</span>
        </div>

        {/* Detail rows */}
        <div className="divide-y divide-border">
          <SummaryRow icon={<Scissors size={14} className="text-accent-foreground" strokeWidth={2} />} label="Service" value={svc?.name ?? data.service ?? '—'} sub={data.duration ? `~${formatDuration(data.duration)}` : undefined} />
          <SummaryRow icon={<CalendarDays size={14} className="text-accent-foreground" strokeWidth={2} />} label="Date" value={data.slotDate ? formatDate(data.slotDate) : '—'} />
          <SummaryRow icon={<Clock size={14} className="text-accent-foreground" strokeWidth={2} />} label="Time" value={data.slotStartTime ? `${formatTime(data.slotStartTime)} → ~${formatTime(estimatedEnd)}` : '—'} />
          <SummaryRow icon={<MapPin size={14} className="text-accent-foreground" strokeWidth={2} />} label="Location" value={data.area} sub={[data.address, data.buildingNote].filter(Boolean).join(', ')} />
        </div>

        {/* Price footer */}
        <div className="bg-secondary/60 px-5 py-3 flex items-center justify-between">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Total (pay on the day)</span>
          <span className="font-display font-extrabold text-foreground text-lg">{formatPrice(data.price)}</span>
        </div>
      </Card>

      {/* Contact details */}
      <div className="space-y-4">
        <Label>Your Contact Details</Label>

        <div className="space-y-3 mt-2">
          <div className="space-y-1.5">
            <div className="relative">
              <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" strokeWidth={2} />
              <Input
                type="text"
                value={ownerName}
                onChange={(e) => { setOwnerName(e.target.value); setErrors((x) => ({ ...x, ownerName: '' })); }}
                placeholder="Your full name"
                className={`pl-9 ${errors.ownerName ? 'border-destructive' : ''}`}
                aria-invalid={!!errors.ownerName}
              />
            </div>
            {errors.ownerName && <p className="text-destructive text-xs">{errors.ownerName}</p>}
          </div>

          <div className="space-y-1.5">
            <div className="relative">
              <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" strokeWidth={2} />
              <Input
                type="tel"
                value={ownerPhone}
                onChange={(e) => { setOwnerPhone(e.target.value); setErrors((x) => ({ ...x, ownerPhone: '' })); }}
                placeholder="+971 50 123 4567"
                className={`pl-9 ${errors.ownerPhone ? 'border-destructive' : ''}`}
                aria-invalid={!!errors.ownerPhone}
              />
            </div>
            {errors.ownerPhone && <p className="text-destructive text-xs">{errors.ownerPhone}</p>}
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground">
          We&apos;ll send your confirmation via WhatsApp to this number.
        </p>
      </div>

      {apiError && (
        <Card className="border-destructive/40 bg-destructive/5 px-4 py-3 shadow-none">
          <p className="text-destructive text-sm">{apiError}</p>
        </Card>
      )}

      {/* Bottom actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border z-20">
        <div className="max-w-lg mx-auto space-y-2">
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full h-12 font-display font-bold tracking-wide"
          >
            {submitting ? (
              <><Loader2 size={16} className="animate-spin" /> Confirming…</>
            ) : (
              'Confirm Booking'
            )}
          </Button>
          <Button
            onClick={onBack}
            disabled={submitting}
            variant="ghost"
            className="w-full h-10 text-sm font-bold text-muted-foreground"
          >
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-start gap-3 px-5 py-3">
      <div className="mt-0.5 flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="font-semibold text-sm text-foreground mt-0.5 truncate">{value}</p>
        {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
