'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Script from 'next/script';
import dynamic from 'next/dynamic';
import {
  MapPin, Navigation, Building2, ChevronLeft,
  Check, RotateCcw, ChevronDown, ChevronUp, Loader2,
} from 'lucide-react';
import { BookingData } from '@/types';
import { DUBAI_AREAS } from '@/lib/utils';

const LeafletMap = dynamic(() => import('../LeafletMap'), { ssr: false });

interface Props {
  data:     BookingData;
  onChange: (p: Partial<BookingData>) => void;
  onNext:   () => void;
  onBack:   () => void;
}

interface SavedLocation {
  area: string; address: string; buildingNote: string;
  lat: number | null; lng: number | null;
}

const GMAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? '';

// Dubai default centre
const DEFAULT_LAT = 25.2048;
const DEFAULT_LNG = 55.2708;

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

async function reverseGeocode(lat: number, lng: number): Promise<{ addr: string; area: string }> {
  try {
    if (GMAPS_KEY) {
      const res  = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GMAPS_KEY}`);
      const json = await res.json();
      const result = json.results?.[0];
      return { addr: result?.formatted_address ?? '', area: matchArea(result?.address_components ?? []) };
    } else {
      const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
      const json = await res.json();
      const suburb = json.address?.suburb ?? json.address?.neighbourhood ?? json.address?.city_district ?? '';
      return {
        addr: json.display_name ?? '',
        area: DUBAI_AREAS.find((a) =>
          a.toLowerCase().includes(suburb.toLowerCase()) || suburb.toLowerCase().includes(a.toLowerCase())
        ) ?? '',
      };
    }
  } catch { return { addr: '', area: '' }; }
}

export default function LocationStep({ data, onChange, onNext, onBack }: Props) {
  const [mapLat, setMapLat]           = useState(data.lat ?? DEFAULT_LAT);
  const [mapLng, setMapLng]           = useState(data.lng ?? DEFAULT_LNG);
  const [isDragging, setIsDragging]   = useState(false);
  const [locating, setLocating]       = useState(false);
  const [resolving, setResolving]     = useState(false);
  const [sheetOpen, setSheetOpen]     = useState(!!data.address);
  const [googleReady, setGoogleReady] = useState(false);
  const [errors, setErrors]           = useState<Record<string, string>>({});
  const [savedLoc, setSavedLoc]       = useState<SavedLocation | null>(null);
  const addressRef  = useRef<HTMLInputElement>(null);
  const reverseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load saved location on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('scruffs_last_location');
      if (raw) {
        const loc = JSON.parse(raw) as SavedLocation;
        if (loc.address) setSavedLoc(loc);
      }
    } catch { /* ignore */ }
  }, []);

  // Google Places autocomplete
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
      setMapLat(lat); setMapLng(lng);
      onChange({ address: addr, lat, lng, area: area || data.area });
      setErrors({});
      setSheetOpen(true);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleReady]);

  const doReverseGeocode = useCallback(async (lat: number, lng: number) => {
    setResolving(true);
    const { addr, area } = await reverseGeocode(lat, lng);
    onChange({ lat, lng, ...(addr ? { address: addr } : {}), ...(area ? { area } : {}) });
    setResolving(false);
    setSheetOpen(true);
  }, [onChange]);

  const handleMapMoved = useCallback((lat: number, lng: number) => {
    setIsDragging(true);
    setMapLat(lat); setMapLng(lng);
    if (reverseTimer.current) clearTimeout(reverseTimer.current);
    reverseTimer.current = setTimeout(async () => {
      await doReverseGeocode(lat, lng);
      setIsDragging(false);
    }, 700);
  }, [doReverseGeocode]);

  const handleGPS = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setMapLat(lat); setMapLng(lng);
        await doReverseGeocode(lat, lng);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const applySaved = (loc: SavedLocation) => {
    if (loc.lat && loc.lng) { setMapLat(loc.lat); setMapLng(loc.lng); }
    onChange({ area: loc.area, address: loc.address, buildingNote: loc.buildingNote, lat: loc.lat, lng: loc.lng });
    setSheetOpen(true); setErrors({});
  };

  const handleConfirm = () => {
    const e: Record<string, string> = {};
    if (!data.area)            e.area    = 'Select your area';
    if (!data.address?.trim()) e.address = 'Enter building / villa name';
    if (Object.keys(e).length) { setErrors(e); setSheetOpen(true); return; }
    // Save for next time
    try {
      localStorage.setItem('scruffs_last_location', JSON.stringify({
        area: data.area, address: data.address, buildingNote: data.buildingNote ?? '',
        lat: data.lat, lng: data.lng,
      }));
    } catch { /* ignore */ }
    onNext();
  };

  const pinConfirmed = !!(data.lat && data.lng && data.address);

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {GMAPS_KEY && (
        <Script id="gmaps" src={`https://maps.googleapis.com/maps/api/js?key=${GMAPS_KEY}&libraries=places`} onLoad={() => setGoogleReady(true)} />
      )}

      {/* ── Map fills the whole screen ── */}
      <div className="absolute inset-0">
        <LeafletMap lat={mapLat} lng={mapLng} onMoved={handleMapMoved} />
      </div>

      {/* ── Fixed centre pin ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[400]">
        <div className={`flex flex-col items-center transition-all duration-200 ${isDragging ? '-translate-y-4' : ''}`}>
          <div className={`w-12 h-12 rounded-full bg-primary border-4 border-white flex items-center justify-center transition-shadow duration-200 ${isDragging ? 'shadow-2xl scale-110' : 'shadow-xl'}`}>
            <MapPin size={22} className="text-white" strokeWidth={2.5} fill="white" />
          </div>
          <div className={`mt-0.5 rounded-full bg-black/20 transition-all duration-200 ${isDragging ? 'w-5 h-1.5 opacity-30' : 'w-3 h-1 opacity-50'}`} />
        </div>
      </div>

      {/* ── Top floating bar ── */}
      <div className="absolute top-0 left-0 right-0 z-[500] p-3 flex items-center gap-2">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-800 hover:bg-gray-50 active:scale-95 transition-all"
        >
          <ChevronLeft size={20} strokeWidth={2.5} />
        </button>
        <div className="flex-1 bg-white rounded-2xl shadow-lg px-4 py-2.5 flex items-center gap-2">
          <MapPin size={15} className="text-primary flex-shrink-0" strokeWidth={2.5} />
          {isDragging ? (
            <span className="text-sm font-semibold text-muted-foreground">Move map to set pin…</span>
          ) : resolving ? (
            <span className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <Loader2 size={13} className="animate-spin" /> Getting address…
            </span>
          ) : data.address ? (
            <span className="text-sm font-semibold text-foreground truncate">{data.address}</span>
          ) : (
            <span className="text-sm font-semibold text-muted-foreground">Drag map to pin your location</span>
          )}
        </div>
      </div>

      {/* ── GPS button ── */}
      <div className="absolute z-[500]" style={{ bottom: sheetOpen ? 340 : 100, right: 16, transition: 'bottom 0.3s ease' }}>
        <button
          onClick={handleGPS}
          disabled={locating}
          className="w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center text-primary hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-60"
        >
          {locating
            ? <Loader2 size={20} className="animate-spin text-primary" />
            : <Navigation size={20} strokeWidth={2} className={pinConfirmed ? 'text-primary fill-primary/20' : ''} />
          }
        </button>
      </div>

      {/* ── Bottom sheet ── */}
      <div
        className="absolute left-0 right-0 bottom-0 z-[500] bg-white dark:bg-card rounded-t-3xl shadow-2xl transition-transform duration-300"
        style={{ transform: sheetOpen ? 'translateY(0)' : 'translateY(calc(100% - 80px))' }}
      >
        {/* Sheet handle + toggle */}
        <button
          onClick={() => setSheetOpen((v) => !v)}
          className="w-full flex flex-col items-center pt-3 pb-2 focus:outline-none"
        >
          <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600 mb-2" />
          <div className="flex items-center gap-2 px-5 w-full">
            <div className="flex-1 text-left">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                {pinConfirmed ? 'Pinned location' : 'Set your location'}
              </p>
              <p className="text-sm font-bold text-foreground truncate">
                {data.address || 'Move the map to pin your location'}
              </p>
            </div>
            {sheetOpen ? <ChevronDown size={18} className="text-muted-foreground" /> : <ChevronUp size={18} className="text-muted-foreground" />}
          </div>
        </button>

        {/* Sheet content */}
        <div className="px-4 pb-6 space-y-3 max-h-[60vh] overflow-y-auto">

          {/* Saved location quick-use */}
          {savedLoc && savedLoc.address !== data.address && (
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <RotateCcw size={14} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Last used</p>
                <p className="text-sm font-semibold text-foreground truncate">{savedLoc.address}</p>
              </div>
              <button
                onClick={() => applySaved(savedLoc)}
                className="text-xs font-bold text-primary px-3 py-1.5 bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors flex-shrink-0"
              >
                Use
              </button>
            </div>
          )}

          {/* Area */}
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 block">
              Area <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" strokeWidth={2} />
              <select
                value={data.area}
                onChange={(e) => { onChange({ area: e.target.value }); setErrors((x) => ({ ...x, area: '' })); }}
                className={`w-full h-11 rounded-xl border bg-background pl-8 pr-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 ${errors.area ? 'border-destructive' : 'border-border'}`}
              >
                <option value="">Select your area…</option>
                {DUBAI_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            {errors.area && <p className="text-destructive text-xs mt-1">{errors.area}</p>}
          </div>

          {/* Address / building */}
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 block">
              {GMAPS_KEY ? 'Search or confirm address' : 'Building / Villa'} <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" strokeWidth={2} />
              <input
                ref={addressRef}
                type="text"
                value={data.address}
                onChange={(e) => { onChange({ address: e.target.value }); setErrors((x) => ({ ...x, address: '' })); }}
                placeholder="e.g. Marina Diamond 3, Al Fattan Tower…"
                className={`w-full h-11 rounded-xl border bg-background pl-8 pr-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 ${errors.address ? 'border-destructive' : 'border-border'}`}
              />
            </div>
            {errors.address && <p className="text-destructive text-xs mt-1">{errors.address}</p>}
          </div>

          {/* Apt / floor */}
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 block">
              Apartment / Floor (optional)
            </label>
            <input
              type="text"
              value={data.buildingNote}
              onChange={(e) => onChange({ buildingNote: e.target.value })}
              placeholder="e.g. Apt 2304, 23rd Floor…"
              className="w-full h-11 rounded-xl border border-border bg-background px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Confirm CTA */}
          <button
            onClick={handleConfirm}
            className="w-full h-13 rounded-2xl bg-primary text-white font-bold text-base flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all mt-1"
            style={{ height: 52 }}
          >
            <Check size={18} strokeWidth={2.5} />
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
}
