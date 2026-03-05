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

  const [step, setStep] = useState(1);
  const [data, setData] = useState<BookingData>({
    ...INITIAL,
    service: preService ?? null,
  });

  const update = (patch: Partial<BookingData>) =>
    setData((p) => ({ ...p, ...patch }));

  const next = () => setStep((s) => Math.min(s + 1, 4));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const pct = ((step - 1) / 3) * 100;

  return (
    <div className="min-h-screen bg-scruffs-light flex flex-col">
      {/* Top bar */}
      <div className="bg-scruffs-dark sticky top-0 z-30">
        <div className="flex items-center gap-3 px-4 py-3">
          {step > 1 ? (
            <button onClick={back} className="p-1.5 rounded-xl text-scruffs-beige hover:bg-white/10 transition-colors">
              <ArrowLeft size={20} strokeWidth={2.5} />
            </button>
          ) : (
            <Link href="/" className="p-1.5 rounded-xl text-scruffs-beige hover:bg-white/10 transition-colors">
              <ArrowLeft size={20} strokeWidth={2.5} />
            </Link>
          )}
          <div className="flex-1">
            <p className="text-scruffs-beige/60 text-[10px] font-display font-bold uppercase tracking-wider">
              Step {step} of 4
            </p>
            <p className="text-white font-display font-bold text-sm leading-tight">
              {BOOKING_STEPS[step - 1].description}
            </p>
          </div>
          <Image src="/logo-icon-beige.png" alt="Scruffs" width={32} height={32} className="rounded-full opacity-80" />
        </div>

        {/* Step indicators */}
        <div className="flex items-center px-4 pb-3 gap-2">
          {BOOKING_STEPS.map((s) => (
            <div key={s.id} className="flex items-center gap-2 flex-1">
              <div className={`step-dot flex-shrink-0 ${
                s.id < step  ? 'done'   :
                s.id === step ? 'active' : 'pending'
              }`}>
                {s.id < step ? <Check size={13} strokeWidth={3} /> : s.id}
              </div>
              <p className={`text-[10px] font-bold whitespace-nowrap hidden sm:block ${
                s.id === step ? 'text-scruffs-beige' : s.id < step ? 'text-scruffs-teal' : 'text-white/30'
              }`}>{s.label}</p>
              {s.id < 4 && (
                <div className="flex-1 h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(163,192,190,0.2)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      background: '#A3C0BE',
                      width: s.id < step ? '100%' : '0%',
                    }}
                  />
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
