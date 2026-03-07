'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Check, CreditCard, Lock } from 'lucide-react';

const PaymentPanel = dynamic(() => import('./PaymentPanel'), { ssr: false });

interface Props {
  bookingId:     string;
  amount:        number;
  paymentStatus: string;
}

export default function PaymentSection({ bookingId, amount, paymentStatus }: Props) {
  const [open, setOpen] = useState(true);

  if (paymentStatus === 'PAID') {
    return (
      <div className="bg-primary/8 border border-primary/20 rounded-2xl px-4 py-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
          <Check size={18} className="text-primary-foreground" strokeWidth={2.5} />
        </div>
        <div>
          <p className="font-bold text-foreground text-sm">Payment Complete</p>
          <p className="text-xs text-muted-foreground">AED {amount} paid securely online</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border-2 border-primary/30 rounded-2xl overflow-hidden">
      {/* Header — always visible */}
      <div className="bg-primary/5 border-b border-primary/15 px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
              <CreditCard size={16} className="text-primary-foreground" strokeWidth={2} />
            </div>
            <div>
              <p className="font-black text-foreground text-base">Pay Online Now</p>
              <p className="text-xs text-muted-foreground">Secure · Instant confirmation</p>
            </div>
          </div>
          <p className="font-black text-primary text-xl">AED {amount}</p>
        </div>

        {/* Payment method icons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Apple Pay */}
          <div className="h-7 px-2.5 rounded-md bg-black flex items-center gap-1">
            <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            <span className="text-white text-[10px] font-bold">Pay</span>
          </div>
          {/* Google Pay */}
          <div className="h-7 px-2.5 rounded-md bg-white border border-gray-200 flex items-center gap-0.5">
            <svg className="w-8 h-4" viewBox="0 0 48 20" fill="none">
              <text x="0" y="15" fontSize="14" fontWeight="bold" fill="#4285F4">G</text>
              <text x="9" y="15" fontSize="12" fontWeight="500" fill="#3C4043">oogle</text>
              <text x="38" y="15" fontSize="12" fontWeight="500" fill="#3C4043"> Pay</text>
            </svg>
          </div>
          {/* Samsung Pay */}
          <div className="h-7 px-2 rounded-md bg-[#1428A0] flex items-center">
            <span className="text-white text-[9px] font-bold tracking-wider">Samsung Pay</span>
          </div>
          {/* Visa */}
          <div className="h-7 px-2.5 rounded-md bg-[#1A1F71] flex items-center">
            <span className="text-white font-bold italic text-sm tracking-tight">VISA</span>
          </div>
          {/* Mastercard */}
          <div className="h-7 px-2 rounded-md bg-white border border-gray-200 flex items-center gap-0.5">
            <div className="w-4 h-4 rounded-full bg-[#EB001B]" />
            <div className="w-4 h-4 rounded-full bg-[#F79E1B] -ml-1.5" />
          </div>
          {/* Amex */}
          <div className="h-7 px-2.5 rounded-md bg-[#007BC1] flex items-center">
            <span className="text-white font-bold text-[9px] tracking-wider">AMEX</span>
          </div>
        </div>
      </div>

      {/* Payment form — collapsible */}
      <div className="px-4 pt-3 pb-4">
        {open ? (
          <div className="space-y-3">
            <PaymentPanel bookingId={bookingId} amount={amount} />
            <button
              onClick={() => setOpen(false)}
              className="w-full text-xs text-muted-foreground text-center hover:text-foreground py-1 transition-colors"
            >
              I&apos;ll pay cash / card on the day instead
            </button>
          </div>
        ) : (
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">Pay on the day — cash or card accepted</p>
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 mx-auto text-sm font-bold text-primary hover:opacity-80 transition-opacity"
            >
              <Lock size={12} /> Pay online instead (recommended)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
