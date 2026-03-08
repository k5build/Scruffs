'use client';

import { useState, useEffect, useCallback } from 'react';
import { Clock } from 'lucide-react';
import { addDays, format, isToday, isBefore, startOfDay } from 'date-fns';
import { BookingData, VirtualSlot } from '@/types';
import { formatDuration, formatTime } from '@/lib/utils';

interface Props {
  data: BookingData;
  onChange: (p: Partial<BookingData>) => void;
  onNext: () => void;
}

const DAY_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function ServiceSlotStep({ data, onChange, onNext }: Props) {
  const [slots, setSlots]               = useState<VirtualSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(data.slotDate || '');
  const [errors, setErrors]             = useState<Record<string, string>>({});

  const petCount = data.pets.length;
  const dates    = Array.from({ length: 30 }, (_, i) => addDays(new Date(), i));

  const fetchSlots = useCallback(async (dateStr: string, duration: number) => {
    if (!dateStr || duration < 1) return;
    setLoadingSlots(true);
    setSlots([]);
    try {
      const res  = await fetch(`/api/slots?date=${dateStr}&duration=${duration}`);
      const json = await res.json();
      setSlots(json.slots ?? []);
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    if (selectedDate && data.duration > 0) {
      fetchSlots(selectedDate, data.duration);
    }
  }, [selectedDate, data.duration, fetchSlots]);

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
    onChange({ slotDate: dateStr, slotStartTime: '', slotEndTime: '' });
    setErrors((e) => ({ ...e, date: '' }));
  };

  const handleSlotSelect = (slot: VirtualSlot) => {
    onChange({ slotDate: selectedDate, slotStartTime: slot.startTime, slotEndTime: slot.endTime });
    setErrors((e) => ({ ...e, slot: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!selectedDate)         e.date = 'Select a date';
    if (!data.slotStartTime)   e.slot = 'Pick a time slot';
    return e;
  };

  const handleNext = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onNext();
  };

  return (
    <div className="animate-fade-in space-y-6 pb-24">
      <div>
        <h2 className="font-bold text-2xl text-foreground">Pick Your Time Slot</h2>
        <p className="text-muted-foreground text-sm mt-1">
          {petCount > 0
            ? `For ${petCount} pet${petCount > 1 ? 's' : ''} · ~${formatDuration(data.duration)}`
            : 'Choose a date and time'}
        </p>
      </div>

      {/* ── Date picker ── */}
      <div className="space-y-2">
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Select Date</p>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mt-2">
          {dates.map((date) => {
            const str    = format(date, 'yyyy-MM-dd');
            const past   = isBefore(date, startOfDay(new Date()));
            const active = selectedDate === str;
            return (
              <button
                key={str}
                disabled={past}
                onClick={() => handleDateSelect(str)}
                className={`date-pill ${active ? 'selected' : ''} ${past ? 'opacity-30 cursor-not-allowed' : ''}`}
              >
                <span className="text-[10px] font-bold">{DAY_SHORT[date.getDay()]}</span>
                <span className="text-base font-bold leading-none mt-0.5">{format(date, 'd')}</span>
                <span className="text-[9px] font-medium">{format(date, 'MMM')}</span>
                {isToday(date) && (
                  <span className={`text-[9px] font-bold mt-0.5 ${active ? 'opacity-80' : 'text-primary'}`}>
                    Today
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {errors.date && <p className="text-destructive text-xs">{errors.date}</p>}
      </div>

      {/* ── Time slot grid ── */}
      {selectedDate && (
        <div className="space-y-3">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
            Available Times
          </p>

          {loadingSlots && (
            <div className="flex items-center justify-center py-10 gap-2 text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Checking availability…</span>
            </div>
          )}

          {!loadingSlots && slots.length === 0 && (
            <div className="bg-card border border-dashed border-border rounded-2xl p-8 text-center">
              <Clock size={28} className="mx-auto mb-2 text-primary/30" strokeWidth={1.5} />
              <p className="font-semibold text-sm text-foreground">No slots available on this date</p>
              <p className="text-xs text-muted-foreground mt-1">
                {data.duration > 0
                  ? `No ${formatDuration(data.duration)} windows available — try another day`
                  : 'Please try another day'}
              </p>
            </div>
          )}

          {!loadingSlots && slots.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {slots.map((slot) => {
                const selected = data.slotStartTime === slot.startTime;
                return (
                  <button
                    key={slot.startTime}
                    onClick={() => handleSlotSelect(slot)}
                    className={`slot-pill p-3.5 text-left ${selected ? 'selected' : ''}`}
                  >
                    <p className={`font-bold text-sm ${selected ? 'text-primary-foreground' : 'text-foreground'}`}>
                      {formatTime(slot.startTime)}
                    </p>
                    <p className={`text-[10px] mt-0.5 ${selected ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      until ~{formatTime(slot.endTime)}
                    </p>
                    <p className={`text-[10px] font-semibold mt-1 ${selected ? 'text-primary-foreground/80' : 'text-primary'}`}>
                      ~{formatDuration(data.duration)}
                    </p>
                  </button>
                );
              })}
            </div>
          )}

          {errors.slot && <p className="text-destructive text-xs">{errors.slot}</p>}
        </div>
      )}

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border z-20">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleNext}
            disabled={!data.slotStartTime}
            className="w-full bg-primary text-primary-foreground h-12 rounded-xl font-bold text-sm flex items-center justify-between px-5 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>Continue to Location</span>
            {data.price > 0 && <span>AED {data.price}</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
