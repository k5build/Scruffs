'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { CreditCard, ChevronDown } from 'lucide-react';

const PaymentPanel = dynamic(() => import('./PaymentPanel'), { ssr: false });

interface Props {
  bookingId:     string;
  amount:        number;
  paymentStatus: string;
}

export default function PaymentSection({ bookingId, amount, paymentStatus }: Props) {
  const [open, setOpen] = useState(false);

  if (paymentStatus === 'PAID') {
    return (
      <div className="bg-primary/8 border border-primary/20 rounded-2xl px-4 py-3.5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
          <CreditCard size={15} className="text-primary" strokeWidth={2} />
        </div>
        <div>
          <p className="font-bold text-foreground text-sm">Payment Complete</p>
          <p className="text-xs text-muted-foreground">AED {amount} paid online</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-4 hover:bg-secondary/50 transition-colors"
      >
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <CreditCard size={18} className="text-primary" strokeWidth={2} />
        </div>
        <div className="flex-1 text-left">
          <p className="font-bold text-foreground text-sm">Pay Online Now</p>
          <p className="text-xs text-muted-foreground">Apple Pay · Google Pay · Card · AED {amount}</p>
        </div>
        <ChevronDown
          size={16}
          className={`text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="border-t border-border px-4 pb-4 pt-3">
          <PaymentPanel bookingId={bookingId} amount={amount} />
        </div>
      )}

      {!open && (
        <div className="border-t border-border px-4 py-2.5">
          <p className="text-[11px] text-muted-foreground text-center">
            Or pay cash / card on the day — no deposit needed
          </p>
        </div>
      )}
    </div>
  );
}
