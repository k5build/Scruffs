'use client';

import { useState } from 'react';
import { MapPin, Navigation, Link as LinkIcon, Building2, Info, Check } from 'lucide-react';
import { BookingData } from '@/types';
import { DUBAI_AREAS } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

  const handleGPS = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        try {
          const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
          const json = await res.json();
          const addr = json.display_name ?? '';
          const suburb = json.address?.suburb ?? json.address?.neighbourhood ?? json.address?.city_district ?? '';
          const matched = DUBAI_AREAS.find((a) =>
            a.toLowerCase().includes(suburb.toLowerCase()) || suburb.toLowerCase().includes(a.toLowerCase())
          ) ?? '';
          onChange({ lat, lng, address: addr, area: matched || data.area });
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
      <div>
        <h2 className="font-display font-extrabold text-2xl text-foreground">Where Are You?</h2>
        <p className="text-muted-foreground text-sm mt-1">
          We cover all Dubai areas — share your location for accurate scheduling
        </p>
      </div>

      {/* GPS Button */}
      <button onClick={handleGPS} disabled={locating} className="w-full text-left disabled:opacity-60">
        <Card className={`flex items-center gap-4 p-4 transition-all duration-200 shadow-brand-sm ${
          gpsOk
            ? 'border-2 border-accent bg-accent/5'
            : 'border border-border hover:border-accent/50 hover:shadow-brand-md'
        }`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${gpsOk ? 'bg-accent' : 'bg-secondary'}`}>
            {locating ? (
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : gpsOk ? (
              <Check size={21} className="text-accent-foreground" strokeWidth={2.5} />
            ) : (
              <Navigation size={21} className="text-primary" strokeWidth={2} />
            )}
          </div>
          <div>
            <p className="font-display font-bold text-sm text-foreground">
              {locating ? 'Getting your location…' : gpsOk ? 'Location detected' : 'Use my GPS location'}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {gpsOk ? 'Tap to re-detect' : 'Auto-fill your address from GPS'}
            </p>
          </div>
        </Card>
      </button>

      {/* OR divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">or</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Google Maps link */}
      <div className="space-y-2">
        <Label>Paste Google Maps Link</Label>
        <div className="relative mt-2">
          <LinkIcon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" strokeWidth={2} />
          <Input
            type="url"
            value={mapsInput}
            onChange={(e) => handleMapsLink(e.target.value)}
            placeholder="https://maps.app.goo.gl/…"
            className="pl-9"
          />
        </div>
        <p className="text-[11px] text-muted-foreground">
          Share your pin from Google Maps — our driver will confirm before arrival
        </p>
      </div>

      {/* Area dropdown */}
      <div className="space-y-2">
        <Label htmlFor="area">
          Area <span className="text-destructive normal-case font-sans">*</span>
        </Label>
        <div className="relative mt-2">
          <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" strokeWidth={2} />
          <select
            id="area"
            value={data.area}
            onChange={(e) => { onChange({ area: e.target.value }); setErrors((x) => ({ ...x, area: '' })); }}
            className={`flex h-11 w-full rounded-xl border bg-card pl-9 pr-4 py-2.5 text-sm text-foreground shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent ${errors.area ? 'border-destructive' : 'border-border'}`}
          >
            <option value="">Select your area…</option>
            {DUBAI_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        {errors.area && <p className="text-destructive text-xs">{errors.area}</p>}
      </div>

      {/* Building name */}
      <div className="space-y-2">
        <Label htmlFor="address">
          Building / Villa Name <span className="text-destructive normal-case font-sans">*</span>
        </Label>
        <div className="relative mt-2">
          <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" strokeWidth={2} />
          <Input
            id="address"
            type="text"
            value={data.address}
            onChange={(e) => { onChange({ address: e.target.value }); setErrors((x) => ({ ...x, address: '' })); }}
            placeholder="e.g. Marina Diamond 3, Al Fattan Tower…"
            className={`pl-9 ${errors.address ? 'border-destructive ring-destructive/20' : ''}`}
            aria-invalid={!!errors.address}
          />
        </div>
        {errors.address && <p className="text-destructive text-xs">{errors.address}</p>}
      </div>

      {/* Apartment note */}
      <div className="space-y-2">
        <Label htmlFor="buildingNote">Apartment / Floor (optional)</Label>
        <Input
          id="buildingNote"
          type="text"
          value={data.buildingNote}
          onChange={(e) => onChange({ buildingNote: e.target.value })}
          placeholder="e.g. Apt 2304, 23rd Floor, ring buzzer 12…"
          className="mt-2"
        />
      </div>

      {/* Info note */}
      <Card className="p-4 flex items-start gap-3 border-l-4 border-accent shadow-none bg-accent/5">
        <Info size={15} className="text-accent-foreground flex-shrink-0 mt-0.5" strokeWidth={2} />
        <p className="text-[12px] text-foreground leading-relaxed">
          Our groomer will WhatsApp you <strong>30 min before arrival</strong> to confirm your exact location.
          Please ensure parking space for our van is available.
        </p>
      </Card>

      {/* CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border z-20">
        <div className="max-w-lg mx-auto flex gap-3">
          <Button onClick={onBack} variant="outline" className="flex-1 h-12 font-display font-bold">
            Back
          </Button>
          <Button onClick={handleNext} className="flex-[2] h-12 font-display font-bold tracking-wide">
            Continue to Confirm
          </Button>
        </div>
      </div>
    </div>
  );
}
