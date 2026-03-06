'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Script from 'next/script';
import { MapPin, Navigation, Link as LinkIcon, Building2, Info, Check, RotateCcw, ChevronRight, MoveIcon } from 'lucide-react';
import { BookingData } from '@/types';
import { DUBAI_AREAS } from '@/lib/utils';

interface Props {
  data: BookingData;
  onChange: (p: Partial<BookingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

interface SavedLocation {
  area: string;
  address: string;
  buildingNote: string;
  lat: number | null;
  lng: number | null;
}

const GMAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? '';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GMaps = any;

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

/* ─── Interactive map (Talabat-style fixed pin + draggable map) ─── */
function LiveMap({
  lat, lng, address, onMoved,
}: {
  lat: number;
  lng: number;
  address: string;
  onMoved: (lat: number, lng: number, addr: string, area: string) => void;
}) {
  const mapDivRef  = useRef<HTMLDivElement>(null);
  const mapObjRef  = useRef<GMaps>(null);
  const [dragging, setDragging] = useState(false);
  const lastPos    = useRef({ lat, lng });

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = (window as any).google;
    if (!g?.maps || !mapDivRef.current) return;

    const map: GMaps = new g.maps.Map(mapDivRef.current, {
      center:            { lat, lng },
      zoom:              17,
      disableDefaultUI:  true,
      gestureHandling:   'greedy',
      styles: [
        { featureType: 'poi',        elementType: 'labels', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit',    elementType: 'labels', stylers: [{ visibility: 'off' }] },
        { featureType: 'road',       elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
        { featureType: 'road',       elementType: 'labels.text.fill', stylers: [{ color: '#888888' }] },
        { featureType: 'landscape',  elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
        { featureType: 'water',      elementType: 'geometry', stylers: [{ color: '#c9e4f0' }] },
        { featureType: 'building',   elementType: 'geometry.fill', stylers: [{ color: '#e8e8e8' }] },
      ],
    });

    mapObjRef.current = map;

    map.addListener('dragstart', () => setDragging(true));

    map.addListener('idle', async () => {
      setDragging(false);
      const center = map.getCenter();
      const newLat = center.lat() as number;
      const newLng = center.lng() as number;

      // Skip if barely moved
      if (
        Math.abs(newLat - lastPos.current.lat) < 0.0001 &&
        Math.abs(newLng - lastPos.current.lng) < 0.0001
      ) return;

      lastPos.current = { lat: newLat, lng: newLng };

      try {
        let addr = '';
        let area = '';
        if (GMAPS_KEY) {
          const res  = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${newLat},${newLng}&key=${GMAPS_KEY}`);
          const json = await res.json();
          const result = json.results?.[0];
          addr = result?.formatted_address ?? '';
          area = matchArea(result?.address_components ?? []);
        }
        onMoved(newLat, newLng, addr, area);
      } catch { /* ignore */ }
    });

    return () => g.maps.event.clearInstanceListeners(map);
  // Only run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-card border-2 border-primary/40 rounded-2xl overflow-hidden shadow-sm">
      {/* Map canvas */}
      <div className="relative" style={{ height: 220 }}>
        <div ref={mapDivRef} className="w-full h-full" />

        {/* Fixed centre pin — stays still while map drags underneath */}
        <div className="absolute inset-0 flex items-end justify-center pointer-events-none"
             style={{ paddingBottom: '50%' }}>
          <div className={`flex flex-col items-center transition-transform duration-150 ${dragging ? '-translate-y-2' : ''}`}>
            {/* Pin shadow */}
            <div className={`w-3 h-1.5 rounded-full bg-black/20 transition-all duration-150 mt-0.5 ${dragging ? 'w-4 opacity-50' : 'opacity-30'}`} />
            {/* Pin body */}
            <div className="w-10 h-10 rounded-full bg-primary border-[3px] border-white shadow-xl flex items-center justify-center -mt-1.5">
              <MapPin size={18} className="text-primary-foreground" strokeWidth={2.5} fill="currentColor" />
            </div>
          </div>
        </div>

        {/* Drag hint */}
        {!dragging && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-foreground/80 backdrop-blur-sm text-background text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 pointer-events-none">
            <MoveIcon size={10} />
            Drag map to fine-tune pin
          </div>
        )}

        {/* Dragging pulse */}
        {dragging && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1.5 rounded-full pointer-events-none">
            Adjusting…
          </div>
        )}
      </div>

      {/* Address pill below map */}
      <div className="px-4 py-3 flex items-start gap-2.5 border-t border-border">
        <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <MapPin size={12} className="text-primary" strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Pinned address</p>
          <p className="text-sm font-semibold text-foreground leading-snug">{address || 'Locating…'}</p>
        </div>
        <div className="flex-shrink-0 bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
          <Check size={9} strokeWidth={3} /> Confirmed
        </div>
      </div>
    </div>
  );
}

export default function LocationStep({ data, onChange, onNext, onBack }: Props) {
  const [errors, setErrors]             = useState<Record<string, string>>({});
  const [locating, setLocating]         = useState(false);
  const [gpsOk, setGpsOk]               = useState(false);
  const [mapsInput, setMapsInput]       = useState(data.mapsLink || '');
  const [addressInput, setAddressInput] = useState(data.address || '');
  const [googleReady, setGoogleReady]   = useState(false);
  const [savedLoc, setSavedLoc]         = useState<SavedLocation | null>(null);
  const [usingSaved, setUsingSaved]     = useState(false);
  const [showForm, setShowForm]         = useState(!data.address);
  const addressRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('scruffs_last_location');
      if (raw) {
        const loc = JSON.parse(raw) as SavedLocation;
        if (loc.address) setSavedLoc(loc);
      }
    } catch { /* ignore */ }
    if (data.address && data.lat && data.lng) setGpsOk(true);
  }, []);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleReady]);

  const handleMapMoved = useCallback((lat: number, lng: number, addr: string, area: string) => {
    if (addr) setAddressInput(addr);
    onChange({
      lat, lng,
      ...(addr  ? { address: addr }  : {}),
      ...(area  ? { area }           : {}),
    });
  }, [onChange]);

  const applyLocation = (loc: SavedLocation) => {
    onChange({ area: loc.area, address: loc.address, buildingNote: loc.buildingNote, lat: loc.lat, lng: loc.lng });
    setAddressInput(loc.address);
    setGpsOk(!!(loc.lat && loc.lng));
    setUsingSaved(true);
    setShowForm(false);
    setErrors({});
  };

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
            const res  = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GMAPS_KEY}`);
            const json = await res.json();
            const result = json.results?.[0];
            addr = result?.formatted_address ?? '';
            area = matchArea(result?.address_components ?? []);
          } else {
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
          setShowForm(false);
        } catch { /* ignore */ } finally { setLocating(false); }
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
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

  const hasMap = !!(data.lat && data.lng) && googleReady;

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
          Pin your exact location — drag the map to fine-tune
        </p>
      </div>

      {/* ── Saved location card ── */}
      {savedLoc && !showForm && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-4 pt-4 pb-3 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <MapPin size={17} className="text-primary" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Last used address</p>
              <p className="font-bold text-foreground text-sm leading-snug">{savedLoc.address}</p>
              {savedLoc.area && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {savedLoc.area}{savedLoc.buildingNote ? ` · ${savedLoc.buildingNote}` : ''}
                </p>
              )}
            </div>
          </div>

          {usingSaved ? (
            <div className="px-4 pb-4 flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 bg-primary/8 border border-primary/20 rounded-xl px-3 py-2">
                <Check size={13} className="text-primary" strokeWidth={2.5} />
                <span className="text-xs font-bold text-primary">Using this address</span>
              </div>
              <button
                onClick={() => {
                  setUsingSaved(false); setShowForm(true); setGpsOk(false);
                  onChange({ area: '', address: '', lat: null, lng: null, buildingNote: '' });
                  setAddressInput('');
                }}
                className="h-9 px-3 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw size={12} strokeWidth={2.5} /> Change
              </button>
            </div>
          ) : (
            <div className="border-t border-border flex">
              <button
                onClick={() => applyLocation(savedLoc)}
                className="flex-1 flex items-center justify-center gap-1.5 py-3.5 text-sm font-bold text-primary hover:bg-primary/5 transition-colors"
              >
                Use this address <ChevronRight size={14} />
              </button>
              <div className="w-px bg-border" />
              <button
                onClick={() => { setSavedLoc(null); setShowForm(true); }}
                className="flex-1 flex items-center justify-center gap-1.5 py-3.5 text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
              >
                New address
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── LIVE MAP ── */}
      {hasMap && (
        <LiveMap
          lat={data.lat!}
          lng={data.lng!}
          address={data.address}
          onMoved={handleMapMoved}
        />
      )}

      {/* ── GPS Button ── */}
      {(showForm || !savedLoc) && (
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
                {gpsOk ? 'Map shown above · drag to adjust' : 'Auto-fill address + open map'}
              </p>
            </div>
          </div>
        </button>
      )}

      {/* Form fields — shown when no GPS or changing */}
      {(showForm || !savedLoc) && (
        <>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">or type it</span>
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
          </div>

          {/* Area */}
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

          {/* Address search */}
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
        </>
      )}

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
            {hasMap ? 'Confirm Location' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
