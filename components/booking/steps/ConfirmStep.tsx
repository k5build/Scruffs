'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, Clock, MapPin, PawPrint, Scissors, User, Phone, ChevronRight, Loader2 } from 'lucide-react';
import { BookingData } from '@/types';
import { SERVICES, formatDate, formatTime, formatDuration, formatPrice, addMinutesToTime, buildBookingWhatsApp } from '@/lib/utils';

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
          petType:      data.petType,
          petName:      data.petName,
          petBreed:     data.petBreed,
          petAge:       data.petAge,
          petSize:      data.petSize ?? null,
          petNotes:     data.petNotes || undefined,
          service:      data.service,
          price:        data.price,
          duration:     data.duration,
          area:         data.area,
          address:      data.address,
          buildingNote: data.buildingNote || undefined,
          mapsLink:     data.mapsLink || undefined,
          slotId:       data.slotId,
          ownerName:    ownerName.trim(),
          ownerPhone:   ownerPhone.trim(),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setApiError(json.error ?? 'Something went wrong. Please try again.');
        return;
      }

      // Save pet to localStorage for faster future bookings
      if (!data.savedPetId && data.petType && data.petName) {
        try {
          const raw  = localStorage.getItem('scruffs_pets');
          const pets = raw ? JSON.parse(raw) : [];
          const already = pets.find((p: { name: string; breed: string }) =>
            p.name === data.petName && p.breed === data.petBreed
          );
          if (!already) {
            pets.unshift({
              id:    crypto.randomUUID(),
              name:  data.petName,
              type:  data.petType,
              breed: data.petBreed,
              size:  data.petSize ?? null,
              age:   data.petAge,
              notes: data.petNotes || '',
            });
            localStorage.setItem('scruffs_pets', JSON.stringify(pets.slice(0, 5)));
          }
        } catch { /* ignore */ }
      }

      // Save booking stub to localStorage for My Bookings page
      try {
        const raw      = localStorage.getItem('scruffs_bookings');
        const bookings = raw ? JSON.parse(raw) : [];
        bookings.unshift({
          id:            json.booking.id,
          bookingRef:    json.booking.bookingRef,
          petName:       data.petName,
          service:       data.service,
          slotDate:      data.slotDate,
          slotStartTime: data.slotStartTime,
          area:          data.area,
          price:         data.price,
          status:        'CONFIRMED',
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
        <h2 className="font-display font-extrabold text-2xl text-scruffs-dark">Review & Book</h2>
        <p className="text-scruffs-muted text-sm mt-1">Check your details, then confirm your booking</p>
      </div>

      {/* ── Summary card ── */}
      <div className="card overflow-hidden">
        {/* Header */}
        <div className="bg-scruffs-dark px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PawPrint size={16} className="text-scruffs-teal" strokeWidth={2} />
            <span className="text-scruffs-beige font-display font-bold text-sm">{data.petName}</span>
            <span className="text-scruffs-beige/50 text-xs">· {data.petBreed}</span>
          </div>
          <span className="font-display font-extrabold text-scruffs-beige text-base">{formatPrice(data.price)}</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-scruffs-border">
          <SummaryRow
            icon={<Scissors size={15} strokeWidth={2} className="text-scruffs-teal-dark" />}
            label="Service"
            value={svc?.name ?? data.service ?? '—'}
            sub={data.duration ? `~${formatDuration(data.duration)}` : undefined}
          />
          <SummaryRow
            icon={<CalendarDays size={15} strokeWidth={2} className="text-scruffs-teal-dark" />}
            label="Date"
            value={data.slotDate ? formatDate(data.slotDate) : '—'}
          />
          <SummaryRow
            icon={<Clock size={15} strokeWidth={2} className="text-scruffs-teal-dark" />}
            label="Time"
            value={
              data.slotStartTime
                ? `${formatTime(data.slotStartTime)} → ~${formatTime(estimatedEnd)}`
                : '—'
            }
          />
          <SummaryRow
            icon={<MapPin size={15} strokeWidth={2} className="text-scruffs-teal-dark" />}
            label="Location"
            value={data.area}
            sub={[data.address, data.buildingNote].filter(Boolean).join(', ')}
          />
        </div>

        {/* Price row */}
        <div className="bg-scruffs-beige/30 px-4 py-3 flex items-center justify-between">
          <span className="text-xs font-bold text-scruffs-muted uppercase tracking-wide">Total (pay on the day)</span>
          <span className="font-display font-extrabold text-scruffs-dark text-lg">{formatPrice(data.price)}</span>
        </div>
      </div>

      {/* ── Contact info ── */}
      <div>
        <p className="text-xs font-display font-bold text-scruffs-dark uppercase tracking-wide mb-3">Your Contact Details</p>
        <div className="space-y-3">
          {/* Name */}
          <div>
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-scruffs-muted pointer-events-none" strokeWidth={2} />
              <input
                type="text"
                value={ownerName}
                onChange={(e) => { setOwnerName(e.target.value); setErrors((x) => ({ ...x, ownerName: '' })); }}
                placeholder="Your name"
                className={`input-field pl-9 ${errors.ownerName ? 'error' : ''}`}
              />
            </div>
            {errors.ownerName && <p className="text-red-500 text-xs mt-1">{errors.ownerName}</p>}
          </div>

          {/* Phone */}
          <div>
            <div className="relative">
              <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-scruffs-muted pointer-events-none" strokeWidth={2} />
              <input
                type="tel"
                value={ownerPhone}
                onChange={(e) => { setOwnerPhone(e.target.value); setErrors((x) => ({ ...x, ownerPhone: '' })); }}
                placeholder="+971 50 123 4567"
                className={`input-field pl-9 ${errors.ownerPhone ? 'error' : ''}`}
              />
            </div>
            {errors.ownerPhone && <p className="text-red-500 text-xs mt-1">{errors.ownerPhone}</p>}
          </div>
        </div>
        <p className="text-[11px] text-scruffs-muted mt-2">
          We'll send your confirmation via WhatsApp to this number.
        </p>
      </div>

      {apiError && (
        <div className="card border-red-200 bg-red-50 px-4 py-3">
          <p className="text-red-600 text-sm">{apiError}</p>
        </div>
      )}

      {/* ── Bottom actions ── */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-scruffs-light border-t border-scruffs-border z-20">
        <div className="max-w-lg mx-auto space-y-2">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary w-full py-3.5 text-sm font-display font-bold tracking-wide flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <><Loader2 size={16} className="animate-spin" strokeWidth={2} /> Confirming…</>
            ) : (
              <>Confirm Booking <ChevronRight size={16} strokeWidth={2.5} /></>
            )}
          </button>
          <button
            onClick={onBack}
            disabled={submitting}
            className="w-full py-2.5 text-sm font-bold text-scruffs-muted hover:text-scruffs-dark transition-colors"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({
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
        <p className="font-semibold text-sm text-scruffs-dark mt-0.5 truncate">{value}</p>
        {sub && <p className="text-[11px] text-scruffs-muted mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
