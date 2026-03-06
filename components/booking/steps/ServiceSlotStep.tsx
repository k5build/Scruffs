'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bath, Clock, Check, Plus, Minus, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { addDays, format, isToday, isBefore, startOfDay } from 'date-fns';
import { BookingData, AddOnKey, TimeSlot } from '@/types';
import {
  BASE_SERVICE, ADDONS, getBasePrice, calcAddonsPrice, calcTotalDuration,
  formatDuration, formatTime, addMinutesToTime,
} from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

interface Props {
  data: BookingData;
  onChange: (p: Partial<BookingData>) => void;
  onNext: () => void;
}

const DAY_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function ServiceSlotStep({ data, onChange, onNext }: Props) {
  const [slots, setSlots]               = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(data.slotDate || '');
  const [errors, setErrors]             = useState<Record<string, string>>({});
  const [showAddons, setShowAddons]     = useState(true);

  const petType   = data.petType ?? 'DOG';
  const petSize   = data.petSize;
  const basePrice = getBasePrice(petType, petSize);
  const dates     = Array.from({ length: 30 }, (_, i) => addDays(new Date(), i));

  // Recalculate prices + duration whenever addons or pet details change
  useEffect(() => {
    const addonsPrice = calcAddonsPrice(data.addons, petType);
    const duration    = calcTotalDuration(petType, petSize, data.addons);
    onChange({
      service:     'WASH_TIDY',
      basePrice,
      addonsPrice,
      price:       basePrice + addonsPrice,
      duration,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [petType, petSize, JSON.stringify(data.addons)]);

  const fetchSlots = useCallback(async (dateStr: string) => {
    if (!dateStr) return;
    setLoadingSlots(true);
    setSlots([]);
    try {
      const res  = await fetch(`/api/slots?date=${dateStr}`);
      const json = await res.json();
      setSlots(json.slots ?? []);
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    if (selectedDate) fetchSlots(selectedDate);
  }, [selectedDate, fetchSlots]);

  const toggleAddon = (key: AddOnKey) => {
    const def = ADDONS.find((a) => a.key === key)!;
    let next: AddOnKey[];
    if (data.addons.includes(key)) {
      next = data.addons.filter((k) => k !== key);
    } else {
      next = data.addons.filter((k) => !(def.exclusive ?? []).includes(k));
      next = [...next, key];
    }
    onChange({ addons: next });
  };

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
    onChange({ slotId: '', slotDate: dateStr, slotStartTime: '', slotEndTime: '' });
    setErrors((e) => ({ ...e, date: '' }));
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    const estimatedEnd = data.duration ? addMinutesToTime(slot.startTime, data.duration) : slot.endTime;
    onChange({ slotId: slot.id, slotDate: slot.date, slotStartTime: slot.startTime, slotEndTime: estimatedEnd });
    setErrors((e) => ({ ...e, slot: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!selectedDate) e.date = 'Select a date';
    if (!data.slotId)  e.slot = 'Pick a time slot';
    return e;
  };

  const handleNext = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onNext();
  };

  const upgradeAddons = ADDONS.filter((a) => a.category === 'upgrade');
  const careAddons    = ADDONS.filter((a) => a.category === 'care');

  return (
    <div className="animate-fade-in space-y-6 pb-24">
      <div>
        <h2 className="font-display font-extrabold text-2xl text-foreground">Service & Time</h2>
        <p className="text-muted-foreground text-sm mt-1">
          {data.petName ? `For ${data.petName}` : 'Choose add-ons and pick a time slot'}
        </p>
      </div>

      {/* ── Base Service (auto-selected) ── */}
      <div className="space-y-2">
        <Label>Base Service</Label>
        <Card className="p-4 border-2 border-primary bg-primary/5 shadow-brand-md mt-2">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-primary flex items-center justify-center flex-shrink-0">
              <Bath size={20} className="text-primary-foreground" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-display font-bold text-foreground text-sm">{BASE_SERVICE.name}</p>
                <Badge variant="teal" className="text-[9px] tracking-wide">ALWAYS INCLUDED</Badge>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">{BASE_SERVICE.tagline}</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2.5">
                {BASE_SERVICE.includes.map((item) => (
                  <span key={item} className="flex items-center gap-1 text-[11px] text-foreground">
                    <Check size={10} strokeWidth={3} className="text-accent-foreground flex-shrink-0" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-display font-extrabold text-foreground text-lg">AED {basePrice}</p>
              <p className="text-[10px] text-muted-foreground">+VAT</p>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Add-ons ── */}
      <div className="space-y-2">
        <button
          onClick={() => setShowAddons((v) => !v)}
          className="w-full flex items-center justify-between"
        >
          <Label className="cursor-pointer">
            Add-Ons <span className="text-muted-foreground font-normal normal-case text-xs">(optional upgrades)</span>
          </Label>
          <div className="flex items-center gap-1.5">
            {data.addons.length > 0 && (
              <Badge variant="dark" className="text-[9px]">{data.addons.length} selected · +AED {data.addonsPrice}</Badge>
            )}
            {showAddons
              ? <ChevronUp size={15} className="text-muted-foreground" />
              : <ChevronDown size={15} className="text-muted-foreground" />
            }
          </div>
        </button>

        {showAddons && (
          <div className="space-y-4 mt-1">

            {/* Core upgrades */}
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Core Upgrades</p>
              <div className="space-y-2">
                {upgradeAddons.map((addon) => {
                  const selected  = data.addons.includes(addon.key as AddOnKey);
                  const price     = petType === 'CAT' ? addon.priceCat : addon.priceDog;
                  const conflicts = (addon.exclusive ?? []).some((k) => data.addons.includes(k as AddOnKey));
                  const disabled  = !selected && conflicts;

                  return (
                    <button
                      key={addon.key}
                      onClick={() => !disabled && toggleAddon(addon.key as AddOnKey)}
                      disabled={disabled}
                      className={`w-full text-left transition-all duration-200 ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                      <Card className={`p-3.5 flex items-center gap-3 transition-all duration-200 ${
                        selected
                          ? 'border-2 border-accent bg-accent/5 shadow-brand-sm'
                          : 'border border-border hover:border-accent/50'
                      }`}>
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                          selected ? 'bg-accent' : 'bg-secondary'
                        }`}>
                          {selected
                            ? <Minus size={13} strokeWidth={2.5} className="text-accent-foreground" />
                            : <Plus  size={13} strokeWidth={2.5} className="text-muted-foreground" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-display font-bold text-foreground text-sm">{addon.label}</p>
                          <p className="text-[11px] text-muted-foreground">{addon.description}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-display font-bold text-foreground text-sm">+AED {price}</p>
                          <p className="text-[10px] text-muted-foreground">+{addon.extraMins} min</p>
                        </div>
                      </Card>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Care & coat */}
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Care & Coat</p>
              <div className="space-y-2">
                {careAddons.map((addon) => {
                  const selected  = data.addons.includes(addon.key as AddOnKey);
                  const price     = petType === 'CAT' ? addon.priceCat : addon.priceDog;
                  const conflicts = (addon.exclusive ?? []).some((k) => data.addons.includes(k as AddOnKey));
                  const disabled  = !selected && conflicts;

                  return (
                    <button
                      key={addon.key}
                      onClick={() => !disabled && toggleAddon(addon.key as AddOnKey)}
                      disabled={disabled}
                      className={`w-full text-left transition-all duration-200 ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                      <Card className={`px-3.5 py-3 flex items-center gap-3 transition-all duration-200 ${
                        selected
                          ? 'border-2 border-accent bg-accent/5 shadow-brand-sm'
                          : 'border border-border hover:border-accent/50'
                      }`}>
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${
                          selected ? 'bg-accent' : 'bg-secondary'
                        }`}>
                          {selected
                            ? <Check size={11} strokeWidth={3} className="text-accent-foreground" />
                            : <Plus  size={11} strokeWidth={2.5} className="text-muted-foreground" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-foreground text-xs">{addon.label}</p>
                          <p className="text-[10px] text-muted-foreground">{addon.description}</p>
                        </div>
                        <p className="font-display font-bold text-foreground text-xs flex-shrink-0">+AED {price}</p>
                      </Card>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* VAT note */}
            <div className="flex items-center gap-1.5 px-1">
              <Info size={12} className="text-muted-foreground flex-shrink-0" />
              <p className="text-[11px] text-muted-foreground">All prices exclude VAT (5%)</p>
            </div>
          </div>
        )}

        {/* Price summary bar */}
        <Card className="mt-3 px-4 py-3 bg-secondary/50 flex items-center justify-between shadow-none">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Session Total</p>
            <p className="text-[11px] text-muted-foreground">
              AED {basePrice} base
              {data.addons.length > 0 && ` + AED ${data.addonsPrice} add-ons`}
            </p>
          </div>
          <div className="text-right">
            <p className="font-display font-extrabold text-foreground text-xl">AED {data.price}</p>
            <p className="text-[10px] text-muted-foreground">+VAT · pay on day</p>
          </div>
        </Card>
      </div>

      {/* ── Date picker ── */}
      <div className="space-y-2">
        <Label>Select Date</Label>
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
                <span className="text-base font-display font-extrabold leading-none mt-0.5">{format(date, 'd')}</span>
                <span className="text-[9px] font-semibold">{format(date, 'MMM')}</span>
                {isToday(date) && (
                  <span className={`text-[9px] font-extrabold mt-0.5 ${active ? 'text-primary-foreground/80' : 'text-accent-foreground'}`}>
                    Today
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {errors.date && <p className="text-destructive text-xs">{errors.date}</p>}
      </div>

      {/* ── Time slots ── */}
      {selectedDate && (
        <div className="space-y-2">
          <Label>Available Times</Label>
          <div className="mt-2">
            {loadingSlots && (
              <div className="flex items-center justify-center py-10 gap-2 text-muted-foreground">
                <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Checking availability…</span>
              </div>
            )}
            {!loadingSlots && slots.length === 0 && (
              <Card className="p-8 text-center shadow-none border-dashed">
                <Clock size={28} className="mx-auto mb-2 text-accent/50" strokeWidth={1.5} />
                <p className="font-bold text-sm text-foreground">No slots on this date</p>
                <p className="text-xs text-muted-foreground mt-1">Please try another day</p>
              </Card>
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
                      className={`slot-pill p-3.5 text-left ${selected ? 'selected' : ''}`}
                    >
                      <p className={`font-display font-bold text-sm ${selected ? 'text-primary-foreground' : 'text-foreground'}`}>
                        {formatTime(slot.startTime)}
                      </p>
                      <p className={`text-[10px] mt-0.5 ${selected ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        until ~{formatTime(estimatedEnd)}
                      </p>
                      <p className={`text-[10px] font-semibold mt-1 ${selected ? 'text-accent' : 'text-muted-foreground'}`}>
                        ~{formatDuration(data.duration)}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          {errors.slot && <p className="text-destructive text-xs">{errors.slot}</p>}
        </div>
      )}

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border z-20">
        <div className="max-w-lg mx-auto">
          <Button
            onClick={handleNext}
            disabled={!data.slotId}
            className="w-full h-12 font-display font-bold tracking-wide"
          >
            Continue to Location
          </Button>
        </div>
      </div>
    </div>
  );
}
