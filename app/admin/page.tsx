import { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';
import StatsCards from '@/components/admin/StatsCards';
import { formatTime, formatPrice } from '@/lib/utils';
import { Dog, Cat, CalendarDays, Clock, ArrowRight, ClipboardList, Plus, Phone } from 'lucide-react';

export const metadata: Metadata = { title: 'Dashboard – Scruffs Admin' };
export const dynamic = 'force-dynamic';

const STATUS_CFG: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  PENDING:     { label: 'Pending',     dot: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  text: '#92400e' },
  CONFIRMED:   { label: 'Confirmed',   dot: '#3b82f6', bg: 'rgba(59,130,246,0.08)',  text: '#1e40af' },
  IN_PROGRESS: { label: 'In Progress', dot: '#8b5cf6', bg: 'rgba(139,92,246,0.08)',  text: '#5b21b6' },
  COMPLETED:   { label: 'Completed',   dot: '#10b981', bg: 'rgba(16,185,129,0.08)',  text: '#065f46' },
  CANCELLED:   { label: 'Cancelled',   dot: '#ef4444', bg: 'rgba(239,68,68,0.08)',   text: '#991b1b' },
};

async function getStats() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [total, todayCount, pending, confirmed, completed, cancelled, revenue, upcoming] =
    await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({ where: { slot: { date: today } } }),
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.booking.count({ where: { status: 'CONFIRMED' } }),
      prisma.booking.count({ where: { status: 'COMPLETED' } }),
      prisma.booking.count({ where: { status: 'CANCELLED' } }),
      prisma.booking.aggregate({ where: { status: 'COMPLETED' }, _sum: { price: true } }),
      prisma.booking.findMany({
        where: { slot: { date: { gte: today } }, status: { in: ['CONFIRMED', 'PENDING'] } },
        include: { slot: true },
        orderBy: [{ slot: { date: 'asc' } }, { slot: { startTime: 'asc' } }],
        take: 8,
      }),
    ]);

  return {
    stats: { totalBookings: total, todayBookings: todayCount, pendingBookings: pending, confirmedBookings: confirmed, completedBookings: completed, cancelledBookings: cancelled, totalRevenue: revenue._sum.price ?? 0 },
    upcomingBookings: upcoming,
  };
}

export default async function AdminDashboard() {
  const { stats, upcomingBookings } = await getStats();
  const now = new Date();

  return (
    <div className="space-y-8 animate-fade-in">

      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1 flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            {format(now, "EEEE, d MMMM yyyy")} · Dubai
          </p>
        </div>
        <Link
          href="/book"
          target="_blank"
          className="group flex items-center gap-2 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex-shrink-0 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
          style={{
            background: 'linear-gradient(135deg, #3A4F4A 0%, #2d5c54 100%)',
            boxShadow: '0 4px 14px rgba(58,79,74,0.3), 0 1px 0 rgba(255,255,255,0.1) inset',
          }}
        >
          <Plus size={15} strokeWidth={2.5} />
          New Booking
        </Link>
      </div>

      {/* ── Stats ────────────────────────────────────────────────── */}
      <StatsCards stats={stats} />

      {/* ── Quick summary bar ────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl px-5 py-3.5 flex flex-wrap items-center gap-x-6 gap-y-2">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Overview</span>
        {[
          { label: 'Total bookings', value: stats.totalBookings },
          { label: 'Completion rate', value: stats.totalBookings > 0 ? `${Math.round((stats.completedBookings / stats.totalBookings) * 100)}%` : '—' },
          { label: 'Avg. revenue', value: stats.completedBookings > 0 ? formatPrice(stats.totalRevenue / stats.completedBookings) : '—' },
          { label: 'Active today', value: stats.todayBookings },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className="w-px h-4 bg-border" />
            <span className="text-xs text-muted-foreground">{item.label}</span>
            <span className="text-xs font-bold text-foreground">{item.value}</span>
          </div>
        ))}
      </div>

      {/* ── Upcoming Appointments ────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-foreground">Upcoming Appointments</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{upcomingBookings.length} scheduled from today</p>
          </div>
          <Link
            href="/admin/appointments"
            className="group flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted transition-all duration-200 text-foreground"
          >
            View all
            <ArrowRight size={12} className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {upcomingBookings.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-14 text-center">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
              <ClipboardList size={20} className="text-muted-foreground" strokeWidth={1.5} />
            </div>
            <p className="font-semibold text-foreground text-sm">All clear</p>
            <p className="text-muted-foreground text-xs mt-1">No upcoming appointments scheduled</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {upcomingBookings.map((b) => {
              const cfg = STATUS_CFG[b.status];
              return (
                <div
                  key={b.id}
                  className="group bg-card rounded-2xl border border-border p-4 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 hover:border-[#3A4F4A]/20"
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Pet icon */}
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:scale-105"
                        style={{ background: 'rgba(58,79,74,0.08)' }}>
                        {b.petType === 'DOG'
                          ? <Dog  size={17} strokeWidth={2} style={{ color: '#3A4F4A' }} />
                          : <Cat  size={17} strokeWidth={2} style={{ color: '#3A4F4A' }} />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-foreground text-sm leading-tight truncate">
                          {b.petName}
                          <span className="text-muted-foreground font-normal text-xs ml-1.5">· {b.petBreed}</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{b.ownerName}</p>
                      </div>
                    </div>

                    {/* Status badge */}
                    {cfg && (
                      <span className="flex items-center gap-1.5 text-[11px] font-semibold rounded-lg px-2.5 py-1 flex-shrink-0"
                        style={{ background: cfg.bg, color: cfg.text }}>
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
                        {cfg.label}
                      </span>
                    )}
                  </div>

                  {/* Details row */}
                  <div className="mt-3 pt-3 border-t border-border flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CalendarDays size={11} />
                        {format(new Date(b.slot.date), 'd MMM')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {formatTime(b.slot.startTime)}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold" style={{ color: '#3A4F4A' }}>
                      {b.service} · {formatPrice(b.price)}
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 mt-3">
                    <a
                      href={`https://wa.me/${b.ownerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${b.ownerName}! This is Scruffs.ae confirming ${b.petName}'s grooming appointment.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-semibold py-2 rounded-lg border border-border bg-muted hover:bg-[#25d366]/10 hover:border-[#25d366]/30 hover:text-[#128c7e] transition-all duration-200"
                    >
                      <Phone size={11} /> WhatsApp
                    </a>
                    <Link
                      href={`/admin/appointments`}
                      className="flex-1 text-[11px] font-semibold text-center py-2 rounded-lg border border-border bg-muted hover:bg-[#3A4F4A] hover:text-white hover:border-[#3A4F4A] transition-all duration-200"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
