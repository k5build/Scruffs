'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Props {
  area?: string;
}

export default function TopBar({ area }: Props) {
  const [locationLabel, setLocationLabel] = useState(area ?? 'Dubai, UAE');

  useEffect(() => {
    if (!area) {
      const saved = localStorage.getItem('scruffs_area');
      if (saved) setLocationLabel(saved);
    }
  }, [area]);

  return (
    <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-30">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3">
        <Image
          src="/logo-icon-green.png"
          alt="Scruffs"
          width={44}
          height={44}
          className="rounded-2xl flex-shrink-0"
        />
        <div className="flex flex-col leading-none">
          <span className="text-[17px] font-black tracking-[0.18em] text-foreground">SCRUFFS</span>
          <span className="text-[8px] font-bold text-muted-foreground tracking-[0.2em] uppercase mt-0.5">
            Extraordinary Pet Groomers
          </span>
        </div>
      </Link>

      {/* Location chip + settings */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-secondary border border-border rounded-xl px-3 py-1.5">
          <MapPin size={11} className="text-primary" strokeWidth={2.5} />
          <span className="text-xs font-semibold text-foreground">{locationLabel}</span>
        </div>
        <Link
          href="/settings"
          className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors border border-border"
        >
          <Settings size={14} strokeWidth={2} />
        </Link>
      </div>
    </div>
  );
}
