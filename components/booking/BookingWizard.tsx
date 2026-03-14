'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Check } from 'lucide-react';
import { BookingData, BOOKING_STEPS } from '@/types';
import PetStep         from './steps/PetStep';
import ServiceSlotStep from './steps/ServiceSlotStep';
import LocationStep    from './steps/LocationStep';
import ConfirmStep     from './steps/ConfirmStep';

const INITIAL: BookingData = {
  pets: [], price: 0, duration: 0,
  slotDate: '', slotStartTime: '', slotEndTime: '',
  area: '', address: '', buildingNote: '', mapsLink: '', lat: null, lng: null,
  ownerName: '', ownerEmail: '', ownerPhone: '',
};

export default function BookingWizard() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<BookingData>({ ...INITIAL });

  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.json()).then((d) => {
      if (d.user) {
        setData((prev) => ({
          ...prev,
          ownerName:  prev.ownerName  || d.user.name  || '',
          ownerPhone: prev.ownerPhone || d.user.phone || '',
          ownerEmail: prev.ownerEmail || d.user.email || '',
        }));
      }
    }).catch(() => {});
  }, []);

  void searchParams;

  const update = (patch: Partial<BookingData>) => setData((p) => ({ ...p, ...patch }));
  const next   = () => setStep((s) => Math.min(s + 1, 4));
  const back   = () => setStep((s) => Math.max(s - 1, 1));

  const STEP_LABELS = ['Pets', 'Time', 'Location', 'Confirm'];

  // Location step: full-screen map, no wizard chrome
  if (step === 3) {
    return (
      <LocationStep data={data} onChange={update} onNext={next} onBack={back} />
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Sticky header */}
      <div className="bg-card border-b border-border sticky top-0 z-30">
        <div className="flex items-center gap-3 px-4 py-3 max-w-lg mx-auto">
          {step > 1 ? (
            <button
              onClick={back}
              className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            >
              <ArrowLeft size={17} strokeWidth={2.5} />
            </button>
          ) : (
            <Link
              href="/"
              className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            >
              <ArrowLeft size={17} strokeWidth={2.5} />
            </Link>
          )}
          <Image src="/logo-icon-green.png" alt="Scruffs" width={36} height={36} className="rounded-xl flex-shrink-0" />
          <div className="flex-1">
            <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
              Step {step} of 4
            </p>
            <p className="text-foreground font-bold text-sm leading-tight">
              {BOOKING_STEPS[step - 1].description}
            </p>
          </div>
          {data.price > 0 && (
            <span className="text-sm font-bold text-primary flex-shrink-0">AED {data.price}</span>
          )}
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-1.5 px-4 pb-3 max-w-lg mx-auto">
          {STEP_LABELS.map((label, i) => {
            const id     = i + 1;
            const done   = id < step;
            const active = id === step;
            return (
              <div key={label} className="flex items-center gap-1.5 flex-1">
                <div className={`step-dot flex-shrink-0 ${done ? 'done' : active ? 'active' : 'pending'}`}>
                  {done ? <Check size={12} strokeWidth={3} /> : id}
                </div>
                <p className={`text-[10px] font-semibold whitespace-nowrap hidden sm:block ${
                  active ? 'text-foreground' : done ? 'text-primary' : 'text-muted-foreground/40'
                }`}>{label}</p>
                {id < 4 && (
                  <div className="flex-1 h-px bg-border overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-500" style={{ width: done ? '100%' : '0%' }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-5">
        {step === 1 && <PetStep         data={data} onChange={update} onNext={next} />}
        {step === 2 && <ServiceSlotStep data={data} onChange={update} onNext={next} />}
        {step === 4 && <ConfirmStep     data={data} onBack={back} />}
      </div>
    </div>
  );
}
