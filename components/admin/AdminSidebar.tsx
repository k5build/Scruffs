'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, CalendarDays, Clock, Star,
  Megaphone, ExternalLink, LogOut, ShieldCheck,
} from 'lucide-react';

const NAV = [
  { href: '/admin',              label: 'Dashboard',    Icon: LayoutDashboard },
  { href: '/admin/appointments', label: 'Appointments', Icon: CalendarDays    },
  { href: '/admin/slots',        label: 'Slots',        Icon: Clock           },
  { href: '/admin/loyalty',      label: 'Loyalty',      Icon: Star            },
  { href: '/admin/promotions',   label: 'Promotions',   Icon: Megaphone       },
  { href: '/admin/audit',        label: 'Audit Log',    Icon: ShieldCheck     },
];

export default function AdminSidebar() {
  const path = usePathname();

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    window.location.href = '/admin/login';
  };

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen flex-shrink-0 relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #2d3f3b 0%, #3A4F4A 40%, #2a3d38 100%)' }}>

      {/* Subtle background mesh */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `radial-gradient(circle at 20% 20%, rgba(163,192,190,0.08) 0%, transparent 50%),
                          radial-gradient(circle at 80% 80%, rgba(163,192,190,0.06) 0%, transparent 50%)`,
      }} />

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(163,192,190,0.4), transparent)' }} />

      {/* Brand */}
      <div className="relative px-5 pt-7 pb-6">
        <div className="flex items-center gap-3.5">
          {/* Logo with glow ring */}
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 rounded-2xl" style={{
              background: 'radial-gradient(circle, rgba(163,192,190,0.35) 0%, transparent 70%)',
              transform: 'scale(1.4)',
              filter: 'blur(6px)',
            }} />
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-white/20 shadow-lg" style={{ boxShadow: '0 0 20px rgba(163,192,190,0.25), 0 4px 12px rgba(0,0,0,0.3)' }}>
              <Image
                src="/logo-icon-beige.png"
                alt="Scruffs"
                width={56}
                height={56}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div>
            <p className="font-black text-white text-lg leading-none tracking-wider">SCRUFFS</p>
            <p className="text-[11px] font-medium tracking-[0.2em] uppercase mt-1" style={{ color: 'rgba(163,192,190,0.7)' }}>Admin Panel</p>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-6 h-px" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))' }} />
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 space-y-0.5 relative">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] px-3 mb-3" style={{ color: 'rgba(163,192,190,0.45)' }}>Navigation</p>
        {NAV.map(({ href, label, Icon }) => {
          const active = href === '/admin' ? path === '/admin' : path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="group relative flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
              style={active ? {
                background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)',
                color: '#fff',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 8px rgba(0,0,0,0.15)',
              } : {
                color: 'rgba(255,255,255,0.5)',
              }}
            >
              {/* Active left bar */}
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #A3C0BE, rgba(163,192,190,0.4))' }} />
              )}

              <span className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${active ? 'text-[#A3C0BE]' : 'text-white/40 group-hover:text-white/70'}`}
                style={active ? { background: 'rgba(163,192,190,0.15)' } : {}}>
                <Icon size={16} strokeWidth={active ? 2.5 : 2} />
              </span>

              <span className="flex-1">{label}</span>

              {active && (
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#A3C0BE', boxShadow: '0 0 6px rgba(163,192,190,0.6)' }} />
              )}

              {/* Hover bg */}
              {!active && (
                <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ background: 'rgba(255,255,255,0.05)' }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="relative px-3 pb-6">
        <div className="mb-3 h-px" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))' }} />

        <Link
          href="/"
          target="_blank"
          className="group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-white/5"
          style={{ color: 'rgba(255,255,255,0.4)' }}
        >
          <span className="flex items-center justify-center w-8 h-8 rounded-lg group-hover:text-white/60 text-white/30">
            <ExternalLink size={15} strokeWidth={2} />
          </span>
          <span className="group-hover:text-white/60 transition-colors">View Live Site</span>
        </Link>

        <button
          onClick={handleLogout}
          className="group w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-red-500/10"
          style={{ color: 'rgba(255,255,255,0.4)' }}
        >
          <span className="flex items-center justify-center w-8 h-8 rounded-lg group-hover:text-red-400 text-white/30">
            <LogOut size={15} strokeWidth={2} />
          </span>
          <span className="group-hover:text-red-400 transition-colors">Sign Out</span>
        </button>

        {/* Version */}
        <p className="text-[10px] text-center mt-4" style={{ color: 'rgba(255,255,255,0.15)' }}>Scruffs.ae · Admin v2</p>
      </div>
    </aside>
  );
}
