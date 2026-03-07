'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CalendarCheck, Star, User, Scissors } from 'lucide-react';

const LEFT_NAV  = [
  { href: '/',            icon: Home,          label: 'Home'     },
  { href: '/my-bookings', icon: CalendarCheck, label: 'Bookings' },
];
const RIGHT_NAV = [
  { href: '/loyalty', icon: Star,  label: 'Rewards' },
  { href: '/profile', icon: User,  label: 'Profile' },
];

export default function BottomNav() {
  const path = usePathname();

  const navItem = ({ href, icon: Icon, label }: { href: string; icon: typeof Home; label: string }) => {
    const active = href === '/' ? path === '/' : path.startsWith(href);
    return (
      <Link
        key={href}
        href={href}
        className={`flex flex-col items-center gap-1 min-w-[56px] py-1 transition-colors duration-150 ${
          active ? 'text-primary' : 'text-muted-foreground'
        }`}
      >
        <div className={`p-2 rounded-xl transition-colors duration-150 ${active ? 'bg-primary/10' : ''}`}>
          <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
        </div>
        <span className={`text-[10px] font-semibold ${active ? 'font-bold' : ''}`}>{label}</span>
      </Link>
    );
  };

  return (
    <nav className="bottom-nav fixed bottom-0 left-0 right-0 z-40 flex justify-around items-end px-2 pt-2 pb-6 bg-card">
      {LEFT_NAV.map(navItem)}

      {/* Centre FAB — Book */}
      <div className="flex flex-col items-center relative" style={{ marginTop: '-20px' }}>
        <Link
          href="/book"
          className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity"
        >
          <Scissors size={22} className="text-primary-foreground" strokeWidth={2} />
        </Link>
        <span className="text-[10px] font-bold text-primary mt-1.5">Book</span>
      </div>

      {RIGHT_NAV.map(navItem)}
    </nav>
  );
}
