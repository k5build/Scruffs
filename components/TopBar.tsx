'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MapPin, User, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Props {
  area?: string;
  showNotification?: boolean;
}

export default function TopBar({ area, showNotification = false }: Props) {
  const [locationLabel, setLocationLabel] = useState(area ?? 'Dubai, UAE');

  useEffect(() => {
    if (!area) {
      const saved = localStorage.getItem('scruffs_area');
      if (saved) setLocationLabel(saved);
    }
  }, [area]);

  return (
    <div>
      {/* Brand bar */}
      <div className="brand-bar flex items-center justify-center gap-3 py-3 px-4">
        <Image
          src="/logo-icon-beige.png"
          alt="Scruffs"
          width={28}
          height={28}
          className="rounded-full"
        />
        <span className="text-lg tracking-[0.2em]">SCRUFFS</span>
      </div>

      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-scruffs-border">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-scruffs-teal flex-shrink-0" strokeWidth={2.5} />
          <div>
            <p className="text-[11px] font-semibold text-scruffs-muted uppercase tracking-wide">Home Service</p>
            <p className="text-sm font-bold text-scruffs-dark leading-tight">
              Delivering to: {locationLabel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {showNotification && (
            <button className="relative p-2 rounded-xl hover:bg-scruffs-light transition-colors">
              <Bell size={18} className="text-scruffs-dark" strokeWidth={2} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-400" />
            </button>
          )}
          <Link
            href="/profile"
            className="w-9 h-9 rounded-full bg-scruffs-beige flex items-center justify-center"
          >
            <User size={18} className="text-scruffs-dark" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </div>
  );
}
