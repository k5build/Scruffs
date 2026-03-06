'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MapPin, User, Bell, LogIn } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  area?: string;
  showNotification?: boolean;
}

interface UserMini {
  name?: string | null;
  phone: string;
}

export default function TopBar({ area, showNotification = false }: Props) {
  const [locationLabel, setLocationLabel] = useState(area ?? 'Dubai, UAE');
  const [user, setUser] = useState<UserMini | null>(null);

  useEffect(() => {
    if (!area) {
      const saved = localStorage.getItem('scruffs_area');
      if (saved) setLocationLabel(saved);
    }
    // Fetch auth state
    fetch('/api/auth/me').then((r) => r.json()).then((d) => {
      if (d.user) setUser(d.user);
    }).catch(() => {});
  }, [area]);

  return (
    <div>
      {/* Brand bar */}
      <div className="brand-bar flex items-center justify-center py-3.5 px-4">
        <Image src="/logo-icon-beige.png" alt="Scruffs" width={36} height={36} className="rounded-full mr-2.5" />
        <div className="flex flex-col leading-none">
          <span className="text-[17px] tracking-[0.25em] font-display font-black">SCRUFFS</span>
          <span className="text-[8px] tracking-[0.18em] font-display font-bold opacity-60 uppercase">Extraordinary Pet Groomers</span>
        </div>
      </div>

      {/* Location + actions */}
      <div className="bg-card px-4 py-3 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
            <MapPin size={15} className="text-accent-foreground" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Home Service</p>
            <p className="text-sm font-bold text-foreground leading-tight">{locationLabel}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {showNotification && (
            <Button variant="ghost" size="icon-sm" className="relative rounded-xl text-foreground">
              <Bell size={17} strokeWidth={2} />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-400 border border-white" />
            </Button>
          )}
          <Link href={user ? '/profile' : '/auth'}>
            {user ? (
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors">
                <span className="text-primary-foreground font-display font-black text-sm">
                  {(user.name ?? user.phone).charAt(0).toUpperCase()}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-xl hover:bg-secondary/70 transition-colors">
                <LogIn size={14} className="text-primary" strokeWidth={2.5} />
                <span className="text-xs font-display font-bold text-primary">Login</span>
              </div>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
}
