'use client';

import { useEffect, useRef } from 'react';

interface Props {
  lat: number;
  lng: number;
  onMoved?: (lat: number, lng: number) => void;
}

export default function LeafletMap({ lat, lng, onMoved }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Dynamically import Leaflet (avoids SSR issues)
    import('leaflet').then((L) => {
      // Fix default icon paths broken by webpack
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(containerRef.current!, {
        center:          [lat, lng],
        zoom:            17,
        zoomControl:     false,
        attributionControl: false,
      });

      mapRef.current = map;

      // OpenStreetMap tiles — completely free, no API key
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Fix tiles not rendering when map is inside a conditionally shown container
      setTimeout(() => map.invalidateSize(), 100);

      // Fire onMoved as the map pans
      if (onMoved) {
        map.on('moveend', () => {
          const c = map.getCenter();
          onMoved(c.lat, c.lng);
        });
      }
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  // Run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep map centred if parent updates lat/lng (e.g. GPS detect)
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setView([lat, lng], 17, { animate: true });
  }, [lat, lng]);

  return (
    <>
      {/* Leaflet CSS */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <div ref={containerRef} className="w-full h-full" />
    </>
  );
}
