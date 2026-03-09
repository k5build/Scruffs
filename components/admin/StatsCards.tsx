'use client';

import { useRef, useEffect, useState } from 'react';
import { CalendarDays, Clock, CheckCircle2, Star, Banknote, XCircle } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface Stats {
  totalBookings:     number;
  todayBookings:     number;
  pendingBookings:   number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue:      number;
}

function useCounter(target: number, duration = 800) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

interface CardDef {
  label:   string;
  sub:     string;
  value:   number | string;
  Icon:    React.ElementType;
  accent:  string;
  isStr?:  boolean;
}

function StatCard({ card, delay }: { card: CardDef; delay: number }) {
  const ref     = useRef<HTMLDivElement>(null);
  const numVal  = typeof card.value === 'number' ? card.value : 0;
  const counted = useCounter(numVal, 700 + delay);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width  - 0.5) * 12;
    const y = ((e.clientY - r.top)  / r.height - 0.5) * -12;
    el.style.transform = `perspective(800px) rotateX(${y}deg) rotateY(${x}deg) translateY(-3px)`;
    el.style.boxShadow = `0 16px 40px -8px rgba(0,0,0,0.12), 0 0 0 1px ${card.accent}40`;
  };

  const onLeave = () => {
    const el = ref.current; if (!el) return;
    el.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
    el.style.boxShadow = '';
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="admin-stat-card group relative bg-card border border-border rounded-2xl p-5 flex flex-col gap-3 overflow-hidden cursor-default"
      style={{ transition: 'transform 0.15s ease, box-shadow 0.2s ease', animationDelay: `${delay}ms` }}
    >
      {/* Accent top bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl transition-all duration-300 group-hover:h-1"
        style={{ background: card.accent }} />

      {/* Icon */}
      <div className="flex items-center justify-between">
        <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:scale-110"
          style={{ color: card.accent }}>
          <card.Icon size={17} strokeWidth={2} />
        </div>
        {/* Subtle background watermark */}
        <card.Icon size={48} strokeWidth={1} className="opacity-[0.04] text-foreground -mr-1 -mt-1" />
      </div>

      {/* Value */}
      <div>
        <p className="text-[28px] font-black text-foreground leading-none tabular-nums tracking-tight">
          {card.isStr
            ? card.value
            : counted.toLocaleString()
          }
        </p>
        <p className="text-sm font-semibold text-foreground mt-1.5">{card.label}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{card.sub}</p>
      </div>
    </div>
  );
}

export default function StatsCards({ stats }: { stats: Stats }) {
  const cards: CardDef[] = [
    { label: 'Today',     sub: 'Appointments',      value: stats.todayBookings,     Icon: CalendarDays, accent: '#3A4F4A' },
    { label: 'Pending',   sub: 'Need confirmation', value: stats.pendingBookings,   Icon: Clock,        accent: '#f59e0b' },
    { label: 'Confirmed', sub: 'Upcoming',          value: stats.confirmedBookings, Icon: CheckCircle2, accent: '#3b82f6' },
    { label: 'Completed', sub: 'All time',          value: stats.completedBookings, Icon: Star,         accent: '#10b981' },
    { label: 'Cancelled', sub: 'All time',          value: stats.cancelledBookings, Icon: XCircle,      accent: '#ef4444' },
    { label: 'Revenue',   sub: 'Completed only',    value: formatPrice(stats.totalRevenue), Icon: Banknote, accent: '#3A4F4A', isStr: true },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      {cards.map((card, i) => (
        <StatCard key={card.label} card={card} delay={i * 70} />
      ))}
    </div>
  );
}
