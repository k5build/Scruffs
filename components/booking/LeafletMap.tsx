'use client';

import { useEffect, useRef } from 'react';

interface Props {
  lat:      number;
  lng:      number;
  onMoved?: (lat: number, lng: number) => void;
}

export default function LeafletMap({ lat, lng, onMoved }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef       = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    import('leaflet').then((L) => {
      if (!containerRef.current) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(containerRef.current, {
        center:             [lat, lng],
        zoom:               17,
        zoomControl:        false,
        attributionControl: false,
        // Disable scroll zoom on mobile to avoid page scroll conflicts
        scrollWheelZoom:    false,
      });

      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      if (onMoved) {
        map.on('moveend', () => {
          const c = map.getCenter();
          onMoved(c.lat, c.lng);
        });
      }

      // Ensure tiles fill the container after it has final dimensions
      requestAnimationFrame(() => {
        map.invalidateSize();
      });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-centre when lat/lng change (GPS or saved location)
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setView([lat, lng], 17, { animate: true });
  }, [lat, lng]);

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      {/* Container must fill the parent — parent must have position:relative + explicit height */}
      <div
        ref={containerRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />
    </>
  );
}
