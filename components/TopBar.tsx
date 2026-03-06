'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Props {
  area?: string;
  showNotification?: boolean;
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
      {/* Logo + name */}
      <div className="flex items-center gap-2.5">
        <Image src="/logo-icon-green.png" alt="Scruffs" width={32} height={32} className="rounded-xl" />
        <div className="flex flex-col leading-none">
          <span className="text-[15px] font-bold tracking-wider text-foreground">SCRUFFS</span>
          <span className="text-[9px] font-medium text-muted-foreground tracking-widest uppercase">Pet Groomers Dubai</span>
        </div>
      </div>

      {/* Location + settings */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-secondary rounded-xl px-3 py-1.5">
          <MapPin size={12} className="text-primary" strokeWidth={2.5} />
          <span className="text-xs font-semibold text-foreground">{locationLabel}</span>
        </div>
        <Link
          href="/settings"
          className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <Settings size={15} strokeWidth={2} />
        </Link>
      </div>
    </div>
  );
}
