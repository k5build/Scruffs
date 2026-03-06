'use client';

import { useState, useEffect, useRef } from 'react';
import Script from 'next/script';
import { MapPin, Navigation, Link as LinkIcon, Building2, Info, Check } from 'lucide-react';
import { BookingData } from '@/types';
import { DUBAI_AREAS } from '@/lib/utils';

interface Props {
  data: BookingData;
  onChange: (p: Partial<BookingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const GMAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? '';

function matchArea(components: { long_name: string; types: string[] }[]): string {
  const suburb = components.find((c) =>
    c.types.includes('sublocality_level_1') ||
    c.types.includes('sublocality') ||
    c.types.includes('neighborhood') ||
    c.types.includes('political')
  )?.long_name ?? '';
  return DUBAI_AREAS.find((a) =>
    a.toLowerCase().includes(suburb.toLowerCase()) ||
    suburb.toLowerCase().includes(a.toLowerCase())
  ) ?? '';
}

export default function LocationStep({ data, onChange, onNext, onBack }: Props) {
  const [errors, setErrors]           = useState<Record<string, string>>({});
  const [locating, setLocating]       = useState(false);
  const [gpsOk, setGpsOk]             = useState(false);
  const [mapsInput, setMapsInput]     = useState(data.mapsLink || '');
  const [addressInput, setAddressInput] = useState(data.address || '');
  const [googleReady, setGoogleReady] = useState(false);
  const addressRef = useRef<HTMLInputElement>(null);

  // Initialise Google Places Autocomplete on the address input
  useEffect(() => {
    if (!googleReady || !addressRef.current) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = (window as any).google;
    if (!g?.maps?.places) return;

    const ac = new g.maps.places.Autocomplete(addressRef.current, {
      componentRestrictions: { country: 'ae' },
      fields: ['formatted_address', 'geometry', 'address_components'],
    });

    ac.addListener('place_changed', () => {
      const place = ac.getPlace();
      if (!place.geometry?.location) return;
      const lat  = place.geometry.location.lat() as number;
      const lng  = place.geometry.location.lng() as number;
      const addr = place.formatted_address ?? '';
      const area = matchArea(place.address_components ?? []);
      setAddressInput(addr);
      onChange({ address: addr, lat, lng, area: area || data.area });
      setErrors((e) => ({ ...e, address: '', area: '' }));
      setGpsOk(true);
    });
  }, [googleReady]);

  const handleGPS = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        try {
          let addr = '';
          let area = '';

          if (GMAPS_KEY) {
            // Use Google Geocoding API
            const res  = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GMAPS_KEY}`);
            const json = await res.json();
            const result = json.results?.[0];
            addr = result?.formatted_address ?? '';
            area = matchArea(result?.address_components ?? []);
          } else {
            // Fallback: OpenStreetMap Nominatim
            const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
            const json = await res.json();
            addr = json.display_name ?? '';
            const suburb = json.address?.suburb ?? json.address?.neighbourhood ?? json.address?.city_district ?? '';
            area = DUBAI_AREAS.find((a) =>
              a.toLowerCase().includes(suburb.toLowerCase()) || suburb.toLowerCase().includes(a.toLowerCase())
            ) ?? '';
          }

          setAddressInput(addr);
          onChange({ lat, lng, address: addr, area: area || data.area });
          setGpsOk(true);
          setErrors((e) => ({ ...e, address: '', area: '' }));
        } catch { /* ignore */ } finally { setLocating(false); }
      },
      () => setLocating(false)
    );
  };

  const handleMapsLink = (val: string) => {
    setMapsInput(val);
    const coordMatch = val.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordMatch) {
      onChange({ mapsLink: val, lat: parseFloat(coordMatch[1]), lng: parseFloat(coordMatch[2]) });
    } else {
      onChange({ mapsLink: val });
    }
    setErrors((e) => ({ ...e, mapsLink: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!data.area)           e.area    = 'Select your area';
    if (!data.address.trim()) e.address = 'Enter building / villa name';
    return e;
  };

  const handleNext = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onNext();
  };

  return (
    <div className="animate-fade-in space-y-5 pb-24">
      {GMAPS_KEY && (
        <Script
          id="gmaps"
          src={`https://maps.googleapis.com/maps/api/js?key=${GMAPS_KEY}&libraries=places`}
          onLoad={() => setGoogleReady(true)}
        />
      )}
      <div>
        <h2 className="font-bold text-2xl text-foreground">Where Are You?</h2>
        <p className="text-muted-foreground text-sm mt-1">
          We cover all Dubai areas — share your location for accurate scheduling
        </p>
      </div>

      {/* GPS Button */}
      <button onClick={handleGPS} disabled={locating} className="w-full text-left disabled:opacity-60">
        <div className={`bg-card border rounded-2xl flex items-center gap-4 p-4 transition-all duration-150 ${
          gpsOk ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
        }`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${gpsOk ? 'bg-primary' : 'bg-secondary'}`}>
            {locating ? (
              <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : gpsOk ? (
              <Check size={21} className="text-primary-foreground" strokeWidth={2.5} />
            ) : (
              <Navigation size={21} className="text-primary" strokeWidth={2} />
            )}
          </div>
          <div>
            <p className="font-bold text-sm text-foreground">
              {locating ? 'Getting your location…' : gpsOk ? 'Location detected' : 'Use my GPS location'}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {gpsOk ? 'Tap to re-detect' : 'Auto-fill your address from GPS'}
            </p>
          </div>
        </div>
      </button>

      {/* OR divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">or</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Google Maps link */}
      <div className="space-y-2">
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Paste Google Maps Link</p>
        <div className="relative mt-2">
          <LinkIcon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" strokeWidth={2} />
          <input
            type="url"
            value={mapsInput}
            onChange={(e) => handleMapsLink(e.target.value)}
            placeholder="https://maps.app.goo.gl/…"
            className="input-field pl-9"
          />
        </div>
        <p className="text-[11px] text-muted-foreground">
          Share your pin from Google Maps — our driver will confirm before arrival
        </p>
      </div>

      {/* Area dropdown */}
      <div className="space-y-2">
        <label htmlFor="area" className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
          Area <span className="text-destructive">*</span>
        </label>
        <div className="relative mt-2">
          <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" strokeWidth={2} />
          <select
            id="area"
            value={data.area}
            onChange={(e) => { onChange({ area: e.target.value }); setErrors((x) => ({ ...x, area: '' })); }}
            className={`flex h-11 w-full rounded-xl border bg-card pl-9 pr-4 py-2.5 text-sm text-foreground transition-colors focus:outline-none focus:ring-1 focus:ring-ring ${errors.area ? 'border-destructive' : 'border-border'}`}
          >
            <option value="">Select your area…</option>
            {DUBAI_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        {errors.area && <p className="text-destructive text-xs">{errors.area}</p>}
      </div>

      {/* Address */}
      <div className="space-y-2">
        <label htmlFor="address" className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
          {GMAPS_KEY ? 'Search Address' : 'Building / Villa Name'} <span className="text-destructive">*</span>
        </label>
        <div className="relative mt-2">
          <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" strokeWidth={2} />
          <input
            id="address"
            ref={addressRef}
            type="text"
            value={addressInput}
            onChange={(e) => { setAddressInput(e.target.value); onChange({ address: e.target.value }); setErrors((x) => ({ ...x, address: '' })); }}
            placeholder={GMAPS_KEY ? 'Start typing your address…' : 'e.g. Marina Diamond 3, Al Fattan Tower…'}
            className={`input-field pl-9 ${errors.address ? 'error' : ''}`}
            aria-invalid={!!errors.address}
          />
        </div>
        {GMAPS_KEY && <p className="text-[11px] text-muted-foreground">Google Maps autocomplete — UAE only</p>}
        {errors.address && <p className="text-destructive text-xs">{errors.address}</p>}
      </div>

      {/* Apartment note */}
      <div className="space-y-2">
        <label htmlFor="buildingNote" className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
          Apartment / Floor (optional)
        </label>
        <input
          id="buildingNote"
          type="text"
          value={data.buildingNote}
          onChange={(e) => onChange({ buildingNote: e.target.value })}
          placeholder="e.g. Apt 2304, 23rd Floor, ring buzzer 12…"
          className="input-field mt-2"
        />
      </div>

      {/* Info note */}
      <div className="bg-primary/8 border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
        <Info size={15} className="text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
        <p className="text-[12px] text-foreground leading-relaxed">
          Our groomer will WhatsApp you <strong>30 min before arrival</strong> to confirm your exact location.
          Please ensure parking space for our van is available.
        </p>
      </div>

      {/* CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border z-20">
        <div className="max-w-lg mx-auto flex gap-3">
          <button onClick={onBack} className="flex-1 h-12 bg-card border border-border rounded-xl font-bold text-sm text-foreground hover:bg-secondary transition-colors">
            Back
          </button>
          <button onClick={handleNext} className="flex-[2] h-12 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:opacity-90 transition-opacity">
            Continue to Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
