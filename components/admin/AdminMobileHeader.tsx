'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, LayoutDashboard, CalendarDays, Clock, Star, Megaphone, ExternalLink, LogOut } from 'lucide-react';

const NAV = [
  { href: '/admin',              label: 'Dashboard',    Icon: LayoutDashboard },
  { href: '/admin/appointments', label: 'Appointments', Icon: CalendarDays    },
  { href: '/admin/slots',        label: 'Slots',        Icon: Clock           },
  { href: '/admin/loyalty',      label: 'Loyalty',      Icon: Star            },
  { href: '/admin/promotions',   label: 'Promotions',   Icon: Megaphone       },
];

export default function AdminMobileHeader() {
  const [open, setOpen] = useState(false);
  const path = usePathname();

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    window.location.href = '/admin/login';
  };

  return (
    <>
      <header className="md:hidden flex items-center justify-between px-4 py-3.5 sticky top-0 z-40 backdrop-blur-md" style={{
        background: 'linear-gradient(135deg, #2d3f3b 0%, #3A4F4A 100%)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.08), 0 4px 20px rgba(0,0,0,0.2)',
      }}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl overflow-hidden ring-1 ring-white/20" style={{ boxShadow: '0 0 12px rgba(163,192,190,0.2)' }}>
            <Image src="/logo-icon-beige.png" alt="Scruffs" width={36} height={36} className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="font-black text-white text-sm tracking-wider leading-none">SCRUFFS</p>
            <p className="text-[9px] tracking-[0.15em] uppercase" style={{ color: 'rgba(163,192,190,0.6)' }}>Admin</p>
          </div>
        </div>
        <button onClick={() => setOpen(true)} className="text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-all">
          <Menu size={20} />
        </button>
      </header>

      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-72 flex flex-col overflow-hidden" style={{
            background: 'linear-gradient(160deg, #2d3f3b 0%, #3A4F4A 50%, #2a3d38 100%)',
            boxShadow: '4px 0 30px rgba(0,0,0,0.4)',
          }}>
            {/* Top glow */}
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(163,192,190,0.4), transparent)' }} />

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl overflow-hidden ring-2 ring-white/20" style={{ boxShadow: '0 0 16px rgba(163,192,190,0.25)' }}>
                  <Image src="/logo-icon-beige.png" alt="Scruffs" width={48} height={48} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-black text-white tracking-wider">SCRUFFS</p>
                  <p className="text-[10px] tracking-[0.18em] uppercase" style={{ color: 'rgba(163,192,190,0.6)' }}>Admin Panel</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/50 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-all">
                <X size={18} />
              </button>
            </div>

            <div className="mx-5 h-px mb-4" style={{ background: 'rgba(255,255,255,0.1)' }} />

            <nav className="flex-1 px-3 space-y-0.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] px-3 mb-3" style={{ color: 'rgba(163,192,190,0.45)' }}>Navigation</p>
              {NAV.map(({ href, label, Icon }) => {
                const active = href === '/admin' ? path === '/admin' : path.startsWith(href);
                return (
                  <Link key={href} href={href} onClick={() => setOpen(false)}
                    className="relative flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
                    style={active ? {
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)',
                      color: '#fff',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
                    } : { color: 'rgba(255,255,255,0.5)' }}
                  >
                    {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full" style={{ background: '#A3C0BE' }} />}
                    <span className={`flex items-center justify-center w-8 h-8 rounded-lg ${active ? 'text-[#A3C0BE]' : 'text-white/40'}`}
                      style={active ? { background: 'rgba(163,192,190,0.15)' } : {}}>
                      <Icon size={16} strokeWidth={active ? 2.5 : 2} />
                    </span>
                    <span className="flex-1">{label}</span>
                    {active && <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#A3C0BE', boxShadow: '0 0 6px rgba(163,192,190,0.6)' }} />}
                  </Link>
                );
              })}
            </nav>

            <div className="px-3 pb-6">
              <div className="mb-3 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
              <Link href="/" target="_blank" onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-white/5"
                style={{ color: 'rgba(255,255,255,0.4)' }}>
                <span className="w-8 h-8 flex items-center justify-center"><ExternalLink size={15} /></span>
                View Live Site
              </Link>
              <button onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-red-500/10 hover:text-red-400"
                style={{ color: 'rgba(255,255,255,0.4)' }}>
                <span className="w-8 h-8 flex items-center justify-center"><LogOut size={15} /></span>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
