'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Script from 'next/script';
import dynamic from 'next/dynamic';
import {
  MapPin, Navigation, Building2, ChevronLeft,
  Check, RotateCcw, Loader2,
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

const GMAPS_KEY   = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? '';
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
      const json = await res.json() as { results?: { formatted_address: string; address_components: { long_name: string; types: string[] }[] }[] };
      const result = json.results?.[0];
      return { addr: result?.formatted_address ?? '', area: matchArea(result?.address_components ?? []) };
    } else {
      const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
      const json = await res.json() as { display_name?: string; address?: { suburb?: string; neighbourhood?: string; city_district?: string } };
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
  const [googleReady, setGoogleReady] = useState(false);
  const [errors, setErrors]           = useState<Record<string, string>>({});
  const [savedLoc, setSavedLoc]       = useState<SavedLocation | null>(null);

  const addressRef   = useRef<HTMLInputElement>(null);
  const reverseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleReady]);

  const doReverseGeocode = useCallback(async (lat: number, lng: number) => {
    setResolving(true);
    const { addr, area } = await reverseGeocode(lat, lng);
    if (addr) onChange({ lat, lng, address: addr, ...(area ? { area } : {}) });
    else onChange({ lat, lng });
    setResolving(false);
  }, [onChange]);

  const handleMapMoved = useCallback((lat: number, lng: number) => {
    setIsDragging(true);
    if (reverseTimer.current) clearTimeout(reverseTimer.current);
    reverseTimer.current = setTimeout(async () => {
      setIsDragging(false);
      await doReverseGeocode(lat, lng);
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
    onChange({ area: loc.area, address: loc.address, buildingNote: loc.buildingNote ?? '', lat: loc.lat, lng: loc.lng });
    setErrors({});
  };

  const handleConfirm = () => {
    const e: Record<string, string> = {};
    if (!data.area)            e.area    = 'Select your area';
    if (!data.address?.trim()) e.address = 'Enter building / villa name';
    if (Object.keys(e).length) { setErrors(e); return; }
    try {
      localStorage.setItem('scruffs_last_location', JSON.stringify({
        area: data.area, address: data.address,
        buildingNote: data.buildingNote ?? '', lat: data.lat, lng: data.lng,
      }));
    } catch { /* ignore */ }
    onNext();
  };

  return (
    // Full screen: flex column, 100dvh
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--background)' }}>
      {GMAPS_KEY && (
        <Script id="gmaps" src={`https://maps.googleapis.com/maps/api/js?key=${GMAPS_KEY}&libraries=places`} onLoad={() => setGoogleReady(true)} />
      )}

      {/* ── MAP SECTION (fills remaining space) ── */}
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <LeafletMap lat={mapLat} lng={mapLng} onMoved={handleMapMoved} />

        {/* Fixed centre pin */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 400 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'transform 0.2s', transform: isDragging ? 'translateY(-12px)' : 'translateY(0)' }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'var(--primary)', border: '4px solid white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: isDragging ? '0 8px 30px rgba(0,0,0,0.35)' : '0 4px 16px rgba(0,0,0,0.25)',
              transform: isDragging ? 'scale(1.1)' : 'scale(1)',
              transition: 'box-shadow 0.2s, transform 0.2s',
            }}>
              <MapPin size={22} color="white" strokeWidth={2.5} fill="white" />
            </div>
            <div style={{
              width: isDragging ? 20 : 10, height: 5, borderRadius: 9999,
              background: 'rgba(0,0,0,0.2)', marginTop: 2,
              transition: 'width 0.2s',
            }} />
          </div>
        </div>

        {/* Top bar — back button + address */}
        <div style={{ position: 'absolute', top: 12, left: 12, right: 12, zIndex: 500, display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={onBack}
            style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'white', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 12px rgba(0,0,0,0.2)', flexShrink: 0,
            }}
          >
            <ChevronLeft size={20} strokeWidth={2.5} color="#333" />
          </button>
          <div style={{
            flex: 1, background: 'white', borderRadius: 16,
            boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
            padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, minWidth: 0,
          }}>
            <MapPin size={15} color="var(--primary)" strokeWidth={2.5} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {isDragging ? 'Move map to set pin…'
                : resolving ? 'Getting address…'
                : data.address || 'Drag map to pin your location'}
            </span>
            {resolving && <Loader2 size={13} style={{ flexShrink: 0, animation: 'spin 1s linear infinite' }} />}
          </div>
        </div>

        {/* GPS button */}
        <button
          onClick={handleGPS}
          disabled={locating}
          style={{
            position: 'absolute', bottom: 16, right: 16, zIndex: 500,
            width: 48, height: 48, borderRadius: '50%',
            background: 'white', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
            opacity: locating ? 0.6 : 1,
          }}
        >
          {locating
            ? <Loader2 size={20} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
            : <Navigation size={20} color="var(--primary)" strokeWidth={2} />
          }
        </button>
      </div>

      {/* ── BOTTOM SHEET (always visible, fixed height) ── */}
      <div style={{
        background: 'var(--card)',
        borderTop: '1px solid var(--border)',
        borderRadius: '20px 20px 0 0',
        padding: '16px 16px 32px',
        display: 'flex', flexDirection: 'column', gap: 12,
        boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
        zIndex: 500, flexShrink: 0,
        maxHeight: '55vh', overflowY: 'auto',
      }}>
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
          <div style={{ width: 36, height: 4, borderRadius: 9999, background: 'var(--border)' }} />
        </div>

        {/* Saved location */}
        {savedLoc && savedLoc.address !== data.address && (
          <div style={{
            background: 'color-mix(in srgb, var(--primary) 8%, transparent)',
            border: '1px solid color-mix(in srgb, var(--primary) 20%, transparent)',
            borderRadius: 14, padding: '10px 12px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <RotateCcw size={15} color="var(--primary)" strokeWidth={2} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Last used</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{savedLoc.address}</p>
            </div>
            <button
              onClick={() => applySaved(savedLoc)}
              style={{
                fontSize: 12, fontWeight: 700, color: 'var(--primary)',
                background: 'color-mix(in srgb, var(--primary) 12%, transparent)',
                border: 'none', borderRadius: 10, padding: '6px 12px', cursor: 'pointer', flexShrink: 0,
              }}
            >
              Use
            </button>
          </div>
        )}

        {/* Area */}
        <div>
          <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
            Area <span style={{ color: 'var(--destructive)' }}>*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <MapPin size={14} color="var(--muted-foreground)" strokeWidth={2} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <select
              value={data.area}
              onChange={(e) => { onChange({ area: e.target.value }); setErrors((x) => ({ ...x, area: '' })); }}
              style={{
                width: '100%', height: 44, borderRadius: 12,
                border: `1px solid ${errors.area ? 'var(--destructive)' : 'var(--border)'}`,
                background: 'var(--background)', paddingLeft: 30, paddingRight: 12,
                fontSize: 14, color: 'var(--foreground)',
                outline: 'none', appearance: 'none', WebkitAppearance: 'none',
              }}
            >
              <option value="">Select your area…</option>
              {DUBAI_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          {errors.area && <p style={{ color: 'var(--destructive)', fontSize: 12, marginTop: 4 }}>{errors.area}</p>}
        </div>

        {/* Address */}
        <div>
          <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
            {GMAPS_KEY ? 'Search or confirm address' : 'Building / Villa'} <span style={{ color: 'var(--destructive)' }}>*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <Building2 size={14} color="var(--muted-foreground)" strokeWidth={2} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              ref={addressRef}
              type="text"
              value={data.address}
              onChange={(e) => { onChange({ address: e.target.value }); setErrors((x) => ({ ...x, address: '' })); }}
              placeholder="e.g. Marina Diamond 3, Al Fattan Tower…"
              style={{
                width: '100%', height: 44, borderRadius: 12,
                border: `1px solid ${errors.address ? 'var(--destructive)' : 'var(--border)'}`,
                background: 'var(--background)', paddingLeft: 30, paddingRight: 12,
                fontSize: 14, color: 'var(--foreground)', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
          {errors.address && <p style={{ color: 'var(--destructive)', fontSize: 12, marginTop: 4 }}>{errors.address}</p>}
        </div>

        {/* Apt / floor */}
        <div>
          <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
            Apartment / Floor <span style={{ fontSize: 10, color: 'var(--muted-foreground)', fontWeight: 400 }}>(optional)</span>
          </label>
          <input
            type="text"
            value={data.buildingNote}
            onChange={(e) => onChange({ buildingNote: e.target.value })}
            placeholder="e.g. Apt 2304, 23rd Floor…"
            style={{
              width: '100%', height: 44, borderRadius: 12,
              border: '1px solid var(--border)',
              background: 'var(--background)', padding: '0 12px',
              fontSize: 14, color: 'var(--foreground)', outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Confirm */}
        <button
          onClick={handleConfirm}
          style={{
            width: '100%', height: 52, borderRadius: 16,
            background: 'var(--primary)', color: 'white',
            border: 'none', cursor: 'pointer',
            fontSize: 16, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            marginTop: 4,
          }}
        >
          <Check size={18} strokeWidth={2.5} />
          Confirm Location
        </button>
      </div>
    </div>
  );
}
