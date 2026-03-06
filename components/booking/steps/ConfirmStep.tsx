'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, Clock, MapPin, PawPrint, Scissors, User, Phone, Loader2, AlertCircle } from 'lucide-react';
import { BookingData } from '@/types';
import { BASE_SERVICE, ADDONS, formatDate, formatTime, formatDuration, formatPrice, addMinutesToTime } from '@/lib/utils';

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

  const estimatedEnd = data.slotStartTime && data.duration
    ? addMinutesToTime(data.slotStartTime, data.duration)
    : data.slotEndTime;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!ownerName.trim())  e.ownerName  = 'Enter your name';
    if (!ownerPhone.trim()) e.ownerPhone = 'Enter your phone number';
    else if (ownerPhone.replace(/\D/g, '').length < 9) e.ownerPhone = 'Enter a valid UAE phone number';
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
          service: data.service ?? 'WASH_TIDY', addons: data.addons,
          price: data.price, duration: data.duration,
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

  const addonsLabel = data.addons.length > 0
    ? data.addons.map((k) => ADDONS.find((a) => a.key === k)?.label ?? k).join(', ')
    : null;

  return (
    <div className="animate-fade-in space-y-5 pb-28">
      <div>
        <h2 className="font-bold text-2xl text-foreground">Review & Book</h2>
        <p className="text-muted-foreground text-sm mt-1">Check your details, then confirm</p>
      </div>

      {/* Summary card */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-primary px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PawPrint size={14} className="text-primary-foreground/80" strokeWidth={2} />
            <span className="text-primary-foreground font-bold text-sm">{data.petName}</span>
            <span className="text-primary-foreground/60 text-xs">· {data.petBreed}</span>
          </div>
          <span className="font-bold text-primary-foreground text-base">{formatPrice(data.price)}</span>
        </div>

        {/* Rows */}
        <div>
          <SummaryRow
            icon={<Scissors size={14} className="text-primary" strokeWidth={2} />}
            label="Service"
            value={BASE_SERVICE.name}
            sub={[data.duration ? `~${formatDuration(data.duration)}` : null, addonsLabel].filter(Boolean).join(' · ') || undefined}
          />
          <SummaryRow icon={<CalendarDays size={14} className="text-primary" strokeWidth={2} />} label="Date" value={data.slotDate ? formatDate(data.slotDate) : '—'} />
          <SummaryRow
            icon={<Clock size={14} className="text-primary" strokeWidth={2} />}
            label="Preferred Window"
            value={data.slotStartTime ? `${formatTime(data.slotStartTime)} → ~${formatTime(estimatedEnd)}` : '—'}
            sub="Exact arrival confirmed by WhatsApp"
          />
          <SummaryRow icon={<MapPin size={14} className="text-primary" strokeWidth={2} />} label="Location" value={data.area} sub={[data.address, data.buildingNote].filter(Boolean).join(', ')} />
        </div>

        {/* Price footer */}
        <div className="bg-secondary/40 px-5 py-3 border-t border-border">
          {data.addons.length > 0 && (
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-muted-foreground">Base + Add-ons</span>
              <span className="text-[11px] text-muted-foreground">AED {data.basePrice} + AED {data.addonsPrice}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Total +VAT · pay on day</span>
            <span className="font-bold text-foreground text-lg">{formatPrice(data.price)}</span>
          </div>
        </div>
      </div>

      {/* Time range reminder */}
      <div className="bg-primary/8 border border-primary/20 rounded-xl px-3.5 py-2.5 flex items-start gap-2.5">
        <AlertCircle size={14} className="text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
        <p className="text-[12px] text-foreground leading-relaxed">
          Your selected time is a <strong>preferred window</strong>. Our groomer will WhatsApp you <strong>30 min before arrival</strong> to confirm the exact time.
        </p>
      </div>

      {/* Contact details */}
      <div className="space-y-3">
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Your Contact Details</p>

        <div className="space-y-2.5 mt-2">
          <div>
            <div className="relative">
              <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" strokeWidth={2} />
              <input
                type="text"
                value={ownerName}
                onChange={(e) => { setOwnerName(e.target.value); setErrors((x) => ({ ...x, ownerName: '' })); }}
                placeholder="Your full name"
                className={`input-field pl-9 ${errors.ownerName ? 'error' : ''}`}
              />
            </div>
            {errors.ownerName && <p className="text-destructive text-xs mt-1">{errors.ownerName}</p>}
          </div>

          <div>
            <div className="relative">
              <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" strokeWidth={2} />
              <input
                type="tel"
                value={ownerPhone}
                onChange={(e) => { setOwnerPhone(e.target.value); setErrors((x) => ({ ...x, ownerPhone: '' })); }}
                placeholder="+971 50 123 4567"
                className={`input-field pl-9 ${errors.ownerPhone ? 'error' : ''}`}
              />
            </div>
            {errors.ownerPhone && <p className="text-destructive text-xs mt-1">{errors.ownerPhone}</p>}
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground">
          We&apos;ll send your confirmation via WhatsApp to this number.
        </p>
      </div>

      {apiError && (
        <div className="border border-destructive/40 bg-destructive/5 rounded-xl px-4 py-3">
          <p className="text-destructive text-sm">{apiError}</p>
        </div>
      )}

      {/* Bottom actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border z-20">
        <div className="max-w-lg mx-auto space-y-2">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-primary text-primary-foreground h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {submitting ? <><Loader2 size={16} className="animate-spin" /> Confirming…</> : 'Confirm Booking'}
          </button>
          <button
            onClick={onBack}
            disabled={submitting}
            className="w-full h-10 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-start gap-3 px-5 py-3 border-b border-border last:border-0">
      <div className="mt-0.5 flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="font-semibold text-sm text-foreground mt-0.5 truncate">{value}</p>
        {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
