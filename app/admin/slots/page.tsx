'use client';

import { useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { formatTime } from '@/lib/utils';
import { Info, Check, X } from 'lucide-react';

interface Slot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  booking: { bookingRef: string; petName: string; ownerName: string } | null;
}

export default function SlotsPage() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [slots,        setSlots]        = useState<Slot[]>([]);
  const [loading,      setLoading]      = useState(false);

  const fetchSlots = async (date: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/slots?date=${date}`);
      const { slots: data } = await res.json();
      setSlots(data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSlots(selectedDate); }, [selectedDate]);

  const toggleSlot = async (slotId: string, isAvailable: boolean) => {
    const res = await fetch('/api/admin/slots', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slotId, isAvailable }),
    });
    if (res.ok) setSlots((prev) => prev.map((s) => (s.id === slotId ? { ...s, isAvailable } : s)));
  };

  const quickDates = Array.from({ length: 14 }, (_, i) => {
    const d = addDays(new Date(), i);
    return { value: format(d, 'yyyy-MM-dd'), label: format(d, 'EEE d MMM') };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Manage Slots</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Enable or disable time slots for each day</p>
      </div>

      {/* Date picker */}
      <div className="bg-card rounded-2xl border border-border p-4">
        <div className="flex items-center gap-3 mb-3">
          <label className="text-sm font-semibold text-foreground">Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input-field w-auto"
          />
        </div>

        {/* Quick picks */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {quickDates.map((d) => (
            <button
              key={d.value}
              onClick={() => setSelectedDate(d.value)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedDate === d.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Slots grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {slots.map((slot) => (
            <div
              key={slot.id}
              className={`rounded-2xl border-2 p-4 transition-all ${
                slot.booking
                  ? 'border-blue-200 bg-blue-50/50'
                  : slot.isAvailable
                  ? 'border-green-200 bg-green-50/50'
                  : 'border-border bg-muted/30'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-foreground">{formatTime(slot.startTime)}</p>
                  <p className="text-xs text-muted-foreground">– {formatTime(slot.endTime)}</p>
                </div>

                {slot.booking ? (
                  <span className="text-xs bg-blue-100 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-semibold">
                    BOOKED
                  </span>
                ) : (
                  <button
                    onClick={() => toggleSlot(slot.id, !slot.isAvailable)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                      slot.isAvailable ? 'bg-green-500' : 'bg-border'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                        slot.isAvailable ? 'left-7' : 'left-1'
                      }`}
                    />
                  </button>
                )}
              </div>

              {slot.booking ? (
                <div className="text-xs text-blue-700">
                  <p className="font-semibold">{slot.booking.petName}</p>
                  <p className="text-blue-500">{slot.booking.ownerName}</p>
                  <p className="font-mono text-blue-400 mt-0.5">{slot.booking.bookingRef}</p>
                </div>
              ) : (
                <p className={`text-xs font-medium flex items-center gap-1 ${slot.isAvailable ? 'text-green-700' : 'text-muted-foreground'}`}>
                  {slot.isAvailable ? <Check size={12} /> : <X size={12} />}
                  {slot.isAvailable ? 'Available' : 'Blocked'}
                </p>
              )}
            </div>
          ))}

          {slots.length === 0 && (
            <div className="col-span-4 text-center py-12 text-muted-foreground">
              <p>No slots found for this date. They are auto-generated when customers visit the booking page.</p>
            </div>
          )}
        </div>
      )}

      {/* Tip */}
      <div className="bg-muted rounded-xl p-4 border border-border flex items-start gap-3 text-sm text-muted-foreground">
        <Info size={16} className="flex-shrink-0 mt-0.5" />
        <p>
          <strong className="text-foreground">Tip:</strong> Slots are automatically generated for the next 90 days when customers visit the booking page.
          Toggle to block or unblock individual slots. Booked slots can only be freed by cancelling the appointment.
        </p>
      </div>
    </div>
  );
}
