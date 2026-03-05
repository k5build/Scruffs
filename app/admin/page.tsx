import { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';
import StatsCards from '@/components/admin/StatsCards';
import { formatTime, formatPrice } from '@/lib/utils';

export const metadata: Metadata = { title: 'Dashboard – Scruffs Admin' };

export const dynamic = 'force-dynamic';

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
        where: {
          slot: { date: { gte: today } },
          status: { in: ['CONFIRMED', 'PENDING'] },
        },
        include: { slot: true },
        orderBy: [{ slot: { date: 'asc' } }, { slot: { startTime: 'asc' } }],
        take: 8,
      }),
    ]);

  return {
    stats: {
      totalBookings:     total,
      todayBookings:     todayCount,
      pendingBookings:   pending,
      confirmedBookings: confirmed,
      completedBookings: completed,
      cancelledBookings: cancelled,
      totalRevenue:      revenue._sum.price ?? 0,
    },
    upcomingBookings: upcoming,
  };
}

const STATUS_COLORS: Record<string, string> = {
  PENDING:     'badge-pending',
  CONFIRMED:   'badge-confirmed',
  IN_PROGRESS: 'badge-in_progress',
  COMPLETED:   'badge-completed',
  CANCELLED:   'badge-cancelled',
};

export default async function AdminDashboard() {
  const { stats, upcomingBookings } = await getStats();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {format(new Date(), "EEEE, d MMMM yyyy")} · Dubai Standard Time
          </p>
        </div>
        <Link
          href="/book"
          target="_blank"
          className="btn-gold px-4 py-2 rounded-xl text-sm font-bold shadow-gold"
        >
          + New Booking
        </Link>
      </div>

      {/* Stats */}
      <StatsCards stats={stats} />

      {/* Upcoming appointments */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Upcoming Appointments</h2>
          <Link href="/admin/appointments" className="text-sm text-yellow-600 hover:underline font-medium">
            View all →
          </Link>
        </div>

        {upcomingBookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400">
            <div className="text-4xl mb-2">📋</div>
            <p>No upcoming appointments</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingBookings.map((b) => (
              <div key={b.id} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-card hover:shadow-card-hover transition-shadow">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center text-xl flex-shrink-0">
                      {b.petType === 'DOG' ? '🐕' : '🐈'}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{b.petName}
                        <span className="text-gray-400 font-normal text-xs ml-2">({b.petBreed})</span>
                      </p>
                      <p className="text-xs text-gray-500">{b.ownerName} · {b.ownerPhone}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{b.area}, {b.address}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold rounded-lg px-2 py-1 flex-shrink-0 ${STATUS_COLORS[b.status] ?? ''}`}>
                    {b.status}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="text-xs text-gray-500">
                    📅 {b.slot.date} · ⏰ {formatTime(b.slot.startTime)}
                  </div>
                  <div className="text-xs font-bold text-yellow-600">
                    {b.service} · {formatPrice(b.price)}
                  </div>
                </div>

                {/* Quick actions */}
                <div className="flex gap-2 mt-3">
                  <a
                    href={`https://wa.me/${b.ownerPhone.replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(b.ownerName)}!%20This%20is%20Scruffs.ae%20confirming%20${encodeURIComponent(b.petName)}s%20appointment.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-xs text-center py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium"
                  >
                    📱 WhatsApp
                  </a>
                  <Link
                    href={`/admin/appointments?id=${b.id}`}
                    className="flex-1 text-xs text-center py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
