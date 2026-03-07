'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface Promotion {
  id: string;
  title: string;
  subtitle: string | null;
  ctaText: string;
  ctaUrl: string;
  bgColor: string;
  textColor: string;
}

export default function PromotionsBanner() {
  const [promos,  setPromos]  = useState<Promotion[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    fetch('/api/promotions')
      .then((r) => r.json())
      .then((d) => setPromos(d.promotions ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (promos.length <= 1) return;
    const t = setInterval(() => setCurrent((c) => (c + 1) % promos.length), 4000);
    return () => clearInterval(t);
  }, [promos.length]);

  if (promos.length === 0) return null;

  const p = promos[current];

  return (
    <div className="relative overflow-hidden rounded-2xl" style={{ backgroundColor: p.bgColor }}>
      <Link href={p.ctaUrl} className="flex items-center gap-4 px-5 py-4">
        <div className="flex-1 min-w-0">
          <p className="font-black text-[17px] leading-tight" style={{ color: p.textColor }}>{p.title}</p>
          {p.subtitle && (
            <p className="text-sm mt-0.5 opacity-75 leading-snug" style={{ color: p.textColor }}>{p.subtitle}</p>
          )}
          <div
            className="inline-flex items-center gap-1 mt-2.5 px-3 py-1.5 rounded-xl text-xs font-bold"
            style={{ backgroundColor: p.textColor, color: p.bgColor }}
          >
            {p.ctaText} <ChevronRight size={11} strokeWidth={2.5} />
          </div>
        </div>
        {/* Decorative circle */}
        <div className="w-16 h-16 rounded-full opacity-10 flex-shrink-0" style={{ backgroundColor: p.textColor }} />
      </Link>

      {/* Dot indicators */}
      {promos.length > 1 && (
        <div className="flex justify-center gap-1.5 pb-2.5">
          {promos.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="w-1.5 h-1.5 rounded-full transition-opacity"
              style={{ backgroundColor: p.textColor, opacity: i === current ? 1 : 0.35 }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
