'use client';

import { useState } from 'react';
import { MapPin, Navigation, Link as LinkIcon, Building2, Info, Check } from 'lucide-react';
import { BookingData } from '@/types';
import { DUBAI_AREAS } from '@/lib/utils';

interface Props {
  data: BookingData;
  onChange: (p: Partial<BookingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function LocationStep({ data, onChange, onNext, onBack }: Props) {
  const [errors, setErrors]       = useState<Record<string, string>>({});
  const [locating, setLocating]   = useState(false);
  const [gpsOk, setGpsOk]         = useState(false);
  const [mapsInput, setMapsInput] = useState(data.mapsLink || '');

  /* ── GPS ── */
  const handleGPS = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        try {
          const res  = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
          );
          const json = await res.json();
          const addr = json.display_name ?? '';
          // try to match area from the result
          const suburb =
            json.address?.suburb ??
            json.address?.neighbourhood ??
            json.address?.city_district ?? '';
          const matched = DUBAI_AREAS.find((a) =>
            a.toLowerCase().includes(suburb.toLowerCase()) ||
            suburb.toLowerCase().includes(a.toLowerCase())
          ) ?? '';
          onChange({
            lat,
            lng,
            address: addr,
            area: matched || data.area,
          });
          setGpsOk(true);
          setErrors((e) => ({ ...e, address: '', area: '' }));
        } catch {
          // ignore reverse geocode failure
        } finally {
          setLocating(false);
        }
      },
      () => setLocating(false)
    );
  };

  /* ── Google Maps link ── */
  const handleMapsLink = (val: string) => {
    setMapsInput(val);
    // Extract lat/lng from maps.google.com/@lat,lng or maps.app.goo.gl (shortened)
    const coordMatch = val.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      onChange({ mapsLink: val, lat, lng });
    } else {
      onChange({ mapsLink: val });
    }
    setErrors((e) => ({ ...e, mapsLink: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!data.area)          e.area    = 'Select your area';
    if (!data.address.trim()) e.address = 'Enter building / villa name';
    return e;
  };

  const handleNext = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onNext();
  };

  return (
    <div className="animate-fade-in space-y-6 pb-24">
      <div>
        <h2 className="font-display font-extrabold text-2xl text-scruffs-dark">Where Are You?</h2>
        <p className="text-scruffs-muted text-sm mt-1">
          We cover all Dubai areas — share your location for accurate scheduling
        </p>
      </div>

      {/* ── GPS Button ── */}
      <button
        onClick={handleGPS}
        disabled={locating}
        className={`w-full card p-4 flex items-center gap-4 transition-all duration-200 ${
          gpsOk
            ? 'border-2 border-scruffs-teal bg-scruffs-teal/5'
            : 'border border-transparent hover:border-scruffs-teal/40'
        } disabled:opacity-60`}
      >
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${gpsOk ? 'bg-scruffs-teal' : 'bg-scruffs-beige'}`}>
          {locating ? (
            <div className="w-5 h-5 border-2 border-scruffs-dark border-t-transparent rounded-full animate-spin" />
          ) : gpsOk ? (
            <Check size={22} className="text-scruffs-dark" strokeWidth={2.5} />
          ) : (
            <Navigation size={22} className="text-scruffs-dark" strokeWidth={2} />
          )}
        </div>
        <div className="text-left">
          <p className="font-display font-bold text-sm text-scruffs-dark">
            {locating ? 'Getting your location…' : gpsOk ? 'Location detected' : 'Use my GPS location'}
          </p>
          <p className="text-[11px] text-scruffs-muted mt-0.5">
            {gpsOk ? 'Tap to re-detect' : 'Auto-fill your address from GPS'}
          </p>
        </div>
      </button>

      {/* ── OR divider ── */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-scruffs-border" />
        <span className="text-[11px] font-bold text-scruffs-muted uppercase tracking-wide">or</span>
        <div className="flex-1 h-px bg-scruffs-border" />
      </div>

      {/* ── Google Maps Link ── */}
      <div>
        <p className="text-xs font-display font-bold text-scruffs-dark uppercase tracking-wide mb-2">
          Paste Google Maps Link
        </p>
        <div className="relative">
          <LinkIcon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-scruffs-muted" strokeWidth={2} />
          <input
            type="url"
            value={mapsInput}
            onChange={(e) => handleMapsLink(e.target.value)}
            placeholder="https://maps.app.goo.gl/…"
            className="input-field pl-9"
          />
        </div>
        <p className="text-[11px] text-scruffs-muted mt-1">
          Share your pin from Google Maps — our driver will confirm before arrival
        </p>
      </div>

      {/* ── Area Dropdown ── */}
      <div>
        <p className="text-xs font-display font-bold text-scruffs-dark uppercase tracking-wide mb-2">
          Area <span className="text-red-400">*</span>
        </p>
        <div className="relative">
          <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-scruffs-muted pointer-events-none" strokeWidth={2} />
          <select
            value={data.area}
            onChange={(e) => { onChange({ area: e.target.value }); setErrors((x) => ({ ...x, area: '' })); }}
            className={`input-field pl-9 ${errors.area ? 'error' : ''}`}
          >
            <option value="">Select your area…</option>
            {DUBAI_AREAS.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area}</p>}
      </div>

      {/* ── Building / Address ── */}
      <div>
        <p className="text-xs font-display font-bold text-scruffs-dark uppercase tracking-wide mb-2">
          Building / Villa Name <span className="text-red-400">*</span>
        </p>
        <div className="relative">
          <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-scruffs-muted pointer-events-none" strokeWidth={2} />
          <input
            type="text"
            value={data.address}
            onChange={(e) => { onChange({ address: e.target.value }); setErrors((x) => ({ ...x, address: '' })); }}
            placeholder="e.g. Marina Diamond 3, Al Fattan Tower…"
            className={`input-field pl-9 ${errors.address ? 'error' : ''}`}
          />
        </div>
        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
      </div>

      {/* ── Apartment / Note ── */}
      <div>
        <p className="text-xs font-display font-bold text-scruffs-dark uppercase tracking-wide mb-2">
          Apartment / Floor (optional)
        </p>
        <input
          type="text"
          value={data.buildingNote}
          onChange={(e) => onChange({ buildingNote: e.target.value })}
          placeholder="e.g. Apt 2304, 23rd Floor, ring buzzer 12…"
          className="input-field"
        />
      </div>

      {/* ── Info note ── */}
      <div className="card p-4 flex items-start gap-3 border-l-4 border-scruffs-teal">
        <Info size={16} className="text-scruffs-teal-dark flex-shrink-0 mt-0.5" strokeWidth={2} />
        <p className="text-[12px] text-scruffs-dark leading-relaxed">
          Our groomer will WhatsApp you <strong>30 min before arrival</strong> to confirm your exact location.
          Please ensure parking space for our van is available.
        </p>
      </div>

      {/* ── CTA ── */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-scruffs-light border-t border-scruffs-border z-20">
        <div className="max-w-lg mx-auto flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 py-3.5 rounded-2xl border-2 border-scruffs-border text-scruffs-dark font-display font-bold text-sm hover:border-scruffs-teal transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            className="flex-[2] btn-primary py-3.5 text-sm font-display font-bold tracking-wide"
          >
            Continue to Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
