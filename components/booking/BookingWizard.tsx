'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
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
  service: null, price: 0, duration: 60,
  slotId: '', slotDate: '', slotStartTime: '', slotEndTime: '',
  area: '', address: '', buildingNote: '', mapsLink: '', lat: null, lng: null,
  ownerName: '', ownerEmail: '', ownerPhone: '',
};

export default function BookingWizard() {
  const searchParams = useSearchParams();
  const preService = searchParams.get('service') as ServiceKey | null;
  const rebookId   = searchParams.get('rebook');

  const [step, setStep] = useState(1);
  const [data, setData] = useState<BookingData>({ ...INITIAL, service: preService ?? null });

  // Load user profile to auto-fill contact details + area preference
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

  // Handle rebook: pre-fill from a past booking
  useEffect(() => {
    if (!rebookId) return;
    fetch(`/api/bookings/${rebookId}`).then((r) => r.ok ? r.json() : null).then((d) => {
      if (!d?.booking) return;
      const b = d.booking;
      setData((prev) => ({
        ...prev,
        petType:  b.petType  ?? prev.petType,
        petSize:  b.petSize  ?? prev.petSize,
        petName:  b.petName  || prev.petName,
        petBreed: b.petBreed || prev.petBreed,
        petAge:   b.petAge   || prev.petAge,
        petNotes: b.petNotes || prev.petNotes,
        service:  (b.service as ServiceKey) ?? prev.service,
        area:     b.area    || prev.area,
        address:  b.address || prev.address,
      }));
    }).catch(() => {});
  }, [rebookId]);

  const update = (patch: Partial<BookingData>) => setData((p) => ({ ...p, ...patch }));
  const next   = () => setStep((s) => Math.min(s + 1, 4));
  const back   = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Sticky header */}
      <div className="bg-primary sticky top-0 z-30">
        <div className="flex items-center gap-3 px-4 py-3.5">
          {step > 1 ? (
            <button onClick={back} className="p-1.5 rounded-xl text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10 transition-colors">
              <ArrowLeft size={20} strokeWidth={2.5} />
            </button>
          ) : (
            <Link href="/" className="p-1.5 rounded-xl text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10 transition-colors">
              <ArrowLeft size={20} strokeWidth={2.5} />
            </Link>
          )}
          <div className="flex-1">
            <p className="text-primary-foreground/50 text-[10px] font-display font-bold uppercase tracking-wider">
              Step {step} of 4
            </p>
            <p className="text-primary-foreground font-display font-bold text-sm leading-tight">
              {BOOKING_STEPS[step - 1].description}
            </p>
          </div>
          <Image src="/logo-icon-beige.png" alt="Scruffs" width={30} height={30} className="rounded-full opacity-80" />
        </div>

        {/* Step progress */}
        <div className="flex items-center px-4 pb-3 gap-2">
          {BOOKING_STEPS.map((s) => (
            <div key={s.id} className="flex items-center gap-2 flex-1">
              <div className={`step-dot flex-shrink-0 ${s.id < step ? 'done' : s.id === step ? 'active' : 'pending'}`}>
                {s.id < step ? <Check size={13} strokeWidth={3} /> : s.id}
              </div>
              <p className={`text-[10px] font-bold whitespace-nowrap hidden sm:block ${
                s.id === step ? 'text-primary-foreground' : s.id < step ? 'text-accent' : 'text-primary-foreground/30'
              }`}>{s.label}</p>
              {s.id < 4 && (
                <div className="flex-1 h-0.5 rounded-full overflow-hidden bg-white/15">
                  <div className="h-full rounded-full transition-all duration-500 bg-accent" style={{ width: s.id < step ? '100%' : '0%' }} />
                </div>
              )}
            </div>
          ))}
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
