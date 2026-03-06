'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check } from 'lucide-react';
import { BookingData, BOOKING_STEPS, ServiceKey } from '@/types';
import PetStep         from './steps/PetStep';
import ServiceSlotStep from './steps/ServiceSlotStep';
import LocationStep    from './steps/LocationStep';
import ConfirmStep     from './steps/ConfirmStep';

const INITIAL: BookingData = {
  petType: null, petSize: null, petName: '', petBreed: '',
  petAge: '', petNotes: '', savedPetId: '',
  service: 'WASH_TIDY', addons: [], basePrice: 0, addonsPrice: 0, price: 0, duration: 60,
  slotId: '', slotDate: '', slotStartTime: '', slotEndTime: '',
  area: '', address: '', buildingNote: '', mapsLink: '', lat: null, lng: null,
  ownerName: '', ownerEmail: '', ownerPhone: '',
};

export default function BookingWizard() {
  const searchParams = useSearchParams();
  const preService = searchParams.get('service') as ServiceKey | null;
  const rebookId   = searchParams.get('rebook');

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

  useEffect(() => {
    if (!rebookId) return;
    fetch(`/api/bookings/${rebookId}`).then((r) => r.ok ? r.json() : null).then((d) => {
      if (!d?.booking) return;
      const b = d.booking;
      setData((prev) => ({
        ...prev,
        petType: b.petType ?? prev.petType, petSize: b.petSize ?? prev.petSize,
        petName: b.petName || prev.petName, petBreed: b.petBreed || prev.petBreed,
        petAge: b.petAge || prev.petAge, petNotes: b.petNotes || prev.petNotes,
        service: (b.service as ServiceKey) ?? prev.service,
        area: b.area || prev.area, address: b.address || prev.address,
      }));
    }).catch(() => {});
  }, [rebookId]);

  void preService;

  const update = (patch: Partial<BookingData>) => setData((p) => ({ ...p, ...patch }));
  const next   = () => setStep((s) => Math.min(s + 1, 4));
  const back   = () => setStep((s) => Math.max(s - 1, 1));

  const STEP_LABELS = ['Pet', 'Service', 'Location', 'Confirm'];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Sticky header */}
      <div className="bg-card border-b border-border sticky top-0 z-30">
        <div className="flex items-center gap-3 px-4 py-3.5 max-w-lg mx-auto">
          {step > 1 ? (
            <button
              onClick={back}
              className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={17} strokeWidth={2.5} />
            </button>
          ) : (
            <Link
              href="/"
              className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={17} strokeWidth={2.5} />
            </Link>
          )}
          <div className="flex-1">
            <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
              Step {step} of 4
            </p>
            <p className="text-foreground font-bold text-sm leading-tight">
              {BOOKING_STEPS[step - 1].description}
            </p>
          </div>
          {/* Price badge if available */}
          {data.price > 0 && (
            <span className="text-sm font-bold text-primary">AED {data.price}</span>
          )}
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-1.5 px-4 pb-3 max-w-lg mx-auto">
          {STEP_LABELS.map((label, i) => {
            const id = i + 1;
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
        {step === 3 && <LocationStep    data={data} onChange={update} onNext={next} onBack={back} />}
        {step === 4 && <ConfirmStep     data={data} onBack={back} />}
      </div>
    </div>
  );
}
