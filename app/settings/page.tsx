'use client';

import Link from 'next/link';
import { ArrowLeft, Sun, Moon, Bell, MapPin, ChevronRight, Smartphone } from 'lucide-react';
import { useState, useEffect } from 'react';
import BottomNav from '@/components/BottomNav';
import { useTheme } from '@/components/ThemeProvider';
import { DUBAI_AREAS } from '@/lib/utils';

export default function SettingsPage() {
  const { theme, toggle } = useTheme();
  const [area, setArea]   = useState('');
  const [notifs, setNotifs] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('scruffs_area');
    if (saved) setArea(saved);
    const n = localStorage.getItem('scruffs_notifs');
    if (n !== null) setNotifs(n === 'true');
  }, []);

  const handleAreaChange = (val: string) => {
    setArea(val);
    localStorage.setItem('scruffs_area', val);
  };

  const handleNotifToggle = () => {
    setNotifs((v) => {
      localStorage.setItem('scruffs_notifs', String(!v));
      return !v;
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-card border-b border-border px-4 py-3.5 flex items-center gap-3 sticky top-0 z-30">
        <Link href="/profile" className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={17} strokeWidth={2.5} />
        </Link>
        <p className="font-bold text-foreground text-base">Settings</p>
      </div>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-5 pb-28 space-y-5">

        {/* Appearance */}
        <div>
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Appearance</p>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">

            {/* Theme toggle */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                  {theme === 'dark' ? <Moon size={15} className="text-primary" strokeWidth={2} /> : <Sun size={15} className="text-primary" strokeWidth={2} />}
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">Theme</p>
                  <p className="text-xs text-muted-foreground capitalize">{theme} mode</p>
                </div>
              </div>
              {/* Toggle switch */}
              <button
                onClick={toggle}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${theme === 'dark' ? 'bg-primary' : 'bg-secondary border border-border'}`}
                aria-label="Toggle theme"
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-card border border-border transition-transform duration-200 ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>

            {/* Theme quick-select */}
            <div className="px-4 py-3.5">
              <p className="text-xs text-muted-foreground mb-3">Choose your preferred look</p>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => theme === 'light' && toggle()}
                  className={`rounded-xl border p-3.5 text-left transition-all duration-150 ${theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/30'}`}
                >
                  <div className="w-8 h-8 rounded-lg bg-[#181A1B] flex items-center justify-center mb-2 border border-[#313538]">
                    <Moon size={14} className="text-[#84B8A9]" strokeWidth={2} />
                  </div>
                  <p className="font-bold text-foreground text-xs">Dark</p>
                  <p className="text-[10px] text-muted-foreground">Premium look</p>
                </button>
                <button
                  onClick={() => theme === 'dark' && toggle()}
                  className={`rounded-xl border p-3.5 text-left transition-all duration-150 ${theme === 'light' ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/30'}`}
                >
                  <div className="w-8 h-8 rounded-lg bg-[#F5F7F7] flex items-center justify-center mb-2 border border-[#E2E5E6]">
                    <Sun size={14} className="text-[#5A9E8F]" strokeWidth={2} />
                  </div>
                  <p className="font-bold text-foreground text-xs">Light</p>
                  <p className="text-[10px] text-muted-foreground">Clean & bright</p>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div>
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Location</p>
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MapPin size={15} className="text-primary" strokeWidth={2} />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">Default Area</p>
                <p className="text-xs text-muted-foreground">Pre-fills your location in booking</p>
              </div>
            </div>
            <select
              value={area}
              onChange={(e) => handleAreaChange(e.target.value)}
              className="flex h-11 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">No default area</option>
              {DUBAI_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>

        {/* Notifications */}
        <div>
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Notifications</p>
          <div className="bg-card border border-border rounded-2xl">
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                  <Bell size={15} className="text-muted-foreground" strokeWidth={2} />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">Booking Reminders</p>
                  <p className="text-xs text-muted-foreground">WhatsApp notifications for appointments</p>
                </div>
              </div>
              <button
                onClick={handleNotifToggle}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${notifs ? 'bg-primary' : 'bg-secondary border border-border'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-card border border-border transition-transform duration-200 ${notifs ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* App info */}
        <div>
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2">About</p>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
              <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                <Smartphone size={15} className="text-muted-foreground" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground text-sm">App Version</p>
                <p className="text-xs text-muted-foreground">Scruffs.ae v2.0</p>
              </div>
            </div>
            {[
              { label: 'Contact Us',          href: '/contact' },
              { label: 'Terms & Conditions',  href: '/terms'   },
            ].map(({ label, href }, i) => (
              <Link key={label} href={href} className="block">
                <div className={`flex items-center justify-between px-4 py-3.5 hover:bg-secondary/50 transition-colors ${i < 1 ? 'border-b border-border' : ''}`}>
                  <p className="font-semibold text-foreground text-sm">{label}</p>
                  <ChevronRight size={14} className="text-muted-foreground" strokeWidth={2} />
                </div>
              </Link>
            ))}
          </div>
        </div>

      </main>

      <BottomNav />
    </div>
  );
}
