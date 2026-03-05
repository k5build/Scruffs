'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CalendarCheck, PawPrint, Menu } from 'lucide-react';

const NAV = [
  { href: '/',           icon: Home,          label: 'Home'     },
  { href: '/my-bookings',icon: CalendarCheck, label: 'Bookings' },
  { href: '/my-pets',    icon: PawPrint,      label: 'My Pets'  },
  { href: '/more',       icon: Menu,          label: 'More'     },
];

export default function BottomNav() {
  const path = usePathname();

  return (
    <nav className="bottom-nav fixed bottom-0 left-0 right-0 z-40 flex justify-around items-center px-4 pt-3 pb-6">
      {NAV.map(({ href, icon: Icon, label }) => {
        const active = href === '/' ? path === '/' : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-1 min-w-[56px] transition-all duration-200 ${
              active ? 'text-scruffs-dark' : 'text-scruffs-muted'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-colors ${active ? 'bg-scruffs-beige' : ''}`}>
              <Icon
                size={22}
                strokeWidth={active ? 2.5 : 1.8}
                className={active ? 'text-scruffs-dark' : 'text-scruffs-muted'}
              />
            </div>
            <span className={`text-[10px] font-display font-700 ${active ? 'font-extrabold' : 'font-semibold'}`}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
