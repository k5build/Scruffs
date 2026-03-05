'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CalendarCheck, PawPrint, User } from 'lucide-react';

const NAV = [
  { href: '/',            icon: Home,          label: 'Home'     },
  { href: '/my-bookings', icon: CalendarCheck, label: 'Bookings' },
  { href: '/my-pets',     icon: PawPrint,      label: 'My Pets'  },
  { href: '/profile',     icon: User,          label: 'Account'  },
];

export default function BottomNav() {
  const path = usePathname();

  return (
    <nav className="bottom-nav fixed bottom-0 left-0 right-0 z-40 flex justify-around items-center px-2 pt-3 pb-6 bg-card">
      {NAV.map(({ href, icon: Icon, label }) => {
        const active = href === '/' ? path === '/' : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-1 min-w-[60px] transition-all duration-200 ${
              active ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <div className={`p-2 rounded-xl transition-all duration-200 ${active ? 'bg-primary/10' : 'hover:bg-muted'}`}>
              <Icon size={21} strokeWidth={active ? 2.5 : 1.8} />
            </div>
            <span className={`text-[10px] font-display ${active ? 'font-extrabold' : 'font-semibold'}`}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
