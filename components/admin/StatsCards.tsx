'use client';

import { CalendarDays, Clock, Check, PawPrint, Star, Banknote } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface Stats {
  totalBookings:    number;
  todayBookings:    number;
  pendingBookings:  number;
  confirmedBookings:number;
  completedBookings:number;
  cancelledBookings:number;
  totalRevenue:     number;
}

interface Props { stats: Stats }

export default function StatsCards({ stats }: Props) {
  const cards = [
    { label: "Today's Appointments", value: stats.todayBookings,     Icon: CalendarDays, text: 'text-blue-600',   bg: 'bg-blue-50'    },
    { label: 'Pending Confirmation', value: stats.pendingBookings,   Icon: Clock,        text: 'text-amber-600', bg: 'bg-amber-50'   },
    { label: 'Confirmed',            value: stats.confirmedBookings, Icon: Check,        text: 'text-green-600', bg: 'bg-green-50'   },
    { label: 'Total Bookings',       value: stats.totalBookings,     Icon: PawPrint,     text: 'text-purple-600',bg: 'bg-purple-50'  },
    { label: 'Completed',            value: stats.completedBookings, Icon: Star,         text: 'text-teal-600',  bg: 'bg-teal-50'    },
    { label: 'Total Revenue',        value: formatPrice(stats.totalRevenue), Icon: Banknote, text: 'text-yellow-700', bg: 'bg-yellow-50', isString: true },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card) => (
        <div key={card.label} className={`${card.bg} rounded-2xl p-4 border border-white shadow-card`}>
          <div className="mb-2">
            <card.Icon size={20} className={card.text} strokeWidth={2} />
          </div>
          <div className={`text-2xl font-bold ${card.text}`}>
            {card.isString ? card.value : (card.value as number).toLocaleString()}
          </div>
          <div className="text-gray-500 text-xs mt-0.5 leading-tight">{card.label}</div>
        </div>
      ))}
    </div>
  );
}
