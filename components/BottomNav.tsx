'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CalendarCheck, PawPrint, User } from 'lucide-react';

const NAV = [
  { href: '/',            icon: Home,          label: 'Home'     },
  { href: '/my-bookings', icon: CalendarCheck, label: 'Bookings' },
  { href: '/my-pets',     icon: PawPrint,      label: 'Pets'     },
  { href: '/profile',     icon: User,          label: 'Profile'  },
];

export default function BottomNav() {
  const path = usePathname();

  return (
    <nav className="bottom-nav fixed bottom-0 left-0 right-0 z-40 flex justify-around items-center px-2 pt-2 pb-6 bg-card">
      {NAV.map(({ href, icon: Icon, label }) => {
        const active = href === '/' ? path === '/' : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-1 min-w-[64px] py-1 transition-colors duration-150 ${
              active ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <div className={`p-2 rounded-xl transition-colors duration-150 ${active ? 'bg-primary/10' : ''}`}>
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
            </div>
            <span className={`text-[10px] font-semibold ${active ? 'font-bold' : ''}`}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
