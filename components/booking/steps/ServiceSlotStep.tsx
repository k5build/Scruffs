'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bath, Scissors, Sparkles, Clock, ChevronRight, Check } from 'lucide-react';
import { addDays, format, isToday, isBefore, startOfDay } from 'date-fns';
import { BookingData, ServiceKey, TimeSlot } from '@/types';
import { SERVICES, PRICING, getPrice, getServiceDuration, formatDuration, formatTime, addMinutesToTime } from '@/lib/utils';

interface Props {
  data: BookingData;
  onChange: (p: Partial<BookingData>) => void;
  onNext: () => void;
}

const SERVICE_ICONS = { BASIC: Bath, SPECIAL: Scissors, FULL: Sparkles };
const DAY_SHORT     = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function ServiceSlotStep({ data, onChange, onNext }: Props) {
  const [slots, setSlots]         = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(data.slotDate || '');
  const [errors, setErrors]       = useState<Record<string, string>>({});

  const dates = Array.from({ length: 30 }, (_, i) => addDays(new Date(), i));
  const isDog = data.petType === 'DOG';

  // Fetch slots when date changes
  const fetchSlots = useCallback(async (dateStr: string) => {
    if (!dateStr) return;
    setLoadingSlots(true);
    setSlots([]);
    try {
      const res = await fetch(`/api/slots?date=${dateStr}`);
      const json = await res.json();
      setSlots(json.slots ?? []);
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    if (selectedDate) fetchSlots(selectedDate);
  }, [selectedDate, fetchSlots]);

  const handleServiceSelect = (svcKey: ServiceKey) => {
    const price    = getPrice(data.petType ?? 'DOG', data.petSize, svcKey);
    const duration = getServiceDuration(data.petType ?? 'DOG', data.petSize, svcKey);
    onChange({ service: svcKey, price, duration, slotId: '', slotDate: '', slotStartTime: '', slotEndTime: '' });
    setErrors((e) => ({ ...e, service: '' }));
  };

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
    onChange({ slotId: '', slotDate: dateStr, slotStartTime: '', slotEndTime: '' });
    setErrors((e) => ({ ...e, date: '' }));
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    const estimatedEnd = data.duration
      ? addMinutesToTime(slot.startTime, data.duration)
      : slot.endTime;
    onChange({
      slotId:        slot.id,
      slotDate:      slot.date,
      slotStartTime: slot.startTime,
      slotEndTime:   estimatedEnd,
    });
    setErrors((e) => ({ ...e, slot: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!data.service)   e.service = 'Choose a service';
    if (!selectedDate)   e.date    = 'Select a date';
    if (!data.slotId)    e.slot    = 'Pick a time slot';
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
        <h2 className="font-display font-extrabold text-2xl text-scruffs-dark">Choose Service & Time</h2>
        <p className="text-scruffs-muted text-sm mt-1">
          {data.petName ? `For ${data.petName}` : 'Select package, date and time slot'}
        </p>
      </div>

      {/* ── Service cards ── */}
      <div>
        <p className="text-xs font-display font-bold text-scruffs-dark uppercase tracking-wide mb-3">Service Package</p>
        <div className="space-y-3">
          {(Object.keys(SERVICES) as ServiceKey[]).map((key) => {
            const svc      = SERVICES[key];
            const Icon     = SERVICE_ICONS[key];
            const price    = getPrice(data.petType ?? 'DOG', data.petSize, key);
            const duration = getServiceDuration(data.petType ?? 'DOG', data.petSize, key);
            const selected = data.service === key;

            return (
              <button
                key={key}
                onClick={() => handleServiceSelect(key)}
                className={`w-full card p-4 text-left transition-all duration-200 ${
                  selected ? 'service-selected border-2 border-scruffs-teal' : 'border border-transparent hover:border-scruffs-teal/40'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    selected ? 'bg-scruffs-dark' : 'bg-scruffs-beige'
                  }`}>
                    <Icon size={22} className={selected ? 'text-scruffs-beige' : 'text-scruffs-dark'} strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-display font-bold text-scruffs-dark text-sm">{svc.name}</p>
                      {'popular' in svc && svc.popular && (
                        <span className="text-[9px] font-display font-extrabold bg-scruffs-dark text-scruffs-beige px-2 py-0.5 rounded-full tracking-wide">
                          POPULAR
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-scruffs-muted mt-0.5">{svc.tagline}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="font-display font-bold text-scruffs-dark text-base">{price > 0 ? `AED ${price}` : 'Select size'}</span>
                      <span className="flex items-center gap-1 text-[11px] text-scruffs-muted">
                        <Clock size={11} strokeWidth={2} /> ~{formatDuration(duration)}
                      </span>
                    </div>
                  </div>
                  {selected && (
                    <div className="w-5 h-5 rounded-full bg-scruffs-teal flex items-center justify-center flex-shrink-0">
                      <Check size={12} strokeWidth={3} className="text-scruffs-dark" />
                    </div>
                  )}
                </div>

                {/* Includes list (expanded when selected) */}
                {selected && (
                  <div className="mt-3 pt-3 border-t border-scruffs-border grid grid-cols-2 gap-1">
                    {svc.includes.map((item) => (
                      <span key={item} className="flex items-center gap-1 text-[11px] text-scruffs-dark">
                        <Check size={10} strokeWidth={3} className="text-scruffs-teal-dark flex-shrink-0" />
                        {item}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {errors.service && <p className="text-red-500 text-xs mt-1">{errors.service}</p>}
      </div>

      {/* ── Date picker ── */}
      {data.service && (
        <div>
          <p className="text-xs font-display font-bold text-scruffs-dark uppercase tracking-wide mb-3">Select Date</p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
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
                  <span className="text-base font-display font-extrabold leading-none mt-0.5">{format(date, 'd')}</span>
                  <span className="text-[9px] font-semibold">{format(date, 'MMM')}</span>
                  {isToday(date) && <span className="today-tag text-[9px] font-extrabold mt-0.5">Today</span>}
                </button>
              );
            })}
          </div>
          {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
        </div>
      )}

      {/* ── Time slots ── */}
      {selectedDate && data.service && (
        <div>
          <p className="text-xs font-display font-bold text-scruffs-dark uppercase tracking-wide mb-3">Available Times</p>

          {loadingSlots && (
            <div className="flex items-center justify-center py-8 gap-2 text-scruffs-muted">
              <div className="w-4 h-4 border-2 border-scruffs-teal border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Checking availability…</span>
            </div>
          )}

          {!loadingSlots && slots.length === 0 && (
            <div className="card p-6 text-center text-scruffs-muted">
              <Clock size={28} className="mx-auto mb-2 text-scruffs-teal/50" strokeWidth={1.5} />
              <p className="font-semibold text-sm">No slots on this date</p>
              <p className="text-xs mt-1">Please try another day</p>
            </div>
          )}

          {!loadingSlots && slots.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {slots.map((slot) => {
                const selected     = data.slotId === slot.id;
                const estimatedEnd = data.duration
                  ? addMinutesToTime(slot.startTime, data.duration)
                  : slot.endTime;

                return (
                  <button
                    key={slot.id}
                    onClick={() => handleSlotSelect(slot)}
                    className={`slot-pill p-3 text-left ${selected ? 'selected' : ''}`}
                  >
                    <p className={`font-display font-bold text-sm ${selected ? 'text-scruffs-beige' : 'text-scruffs-dark'}`}>
                      {formatTime(slot.startTime)}
                    </p>
                    <p className={`text-[10px] mt-0.5 ${selected ? 'text-scruffs-beige/70' : 'text-scruffs-muted'}`}>
                      until ~{formatTime(estimatedEnd)}
                    </p>
                    <p className={`text-[10px] font-semibold mt-1 ${selected ? 'text-scruffs-teal' : 'text-scruffs-muted'}`}>
                      {formatDuration(data.duration)}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
          {errors.slot && <p className="text-red-500 text-xs mt-1">{errors.slot}</p>}
        </div>
      )}

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-scruffs-light border-t border-scruffs-border z-20">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleNext}
            disabled={!data.service || !data.slotId}
            className="btn-primary w-full py-3.5 text-sm font-display font-bold tracking-wide disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue to Location
          </button>
        </div>
      </div>
    </div>
  );
}
