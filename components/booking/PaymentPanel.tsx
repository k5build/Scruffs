'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Loader2, Lock, Check } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '');

interface Props {
  bookingId: string;
  amount:    number; // AED
}

function CheckoutForm({ amount }: { amount: number }) {
  const stripe   = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState(false);

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setLoading(true);
    setError('');

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message ?? 'Payment failed');
      setLoading(false);
      return;
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment/success`,
      },
      redirect: 'if_required',
    });

    if (confirmError) {
      setError(confirmError.message ?? 'Payment failed');
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center gap-3 py-6">
        <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
          <Check size={26} strokeWidth={3} className="text-primary-foreground" />
        </div>
        <p className="font-bold text-foreground text-lg">Payment Successful!</p>
        <p className="text-sm text-muted-foreground text-center">Your booking is fully paid. See you soon!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PaymentElement
        options={{
          layout: 'tabs',
          wallets: { applePay: 'auto', googlePay: 'auto' },
        }}
      />

      {error && (
        <p className="text-destructive text-sm">{error}</p>
      )}

      <button
        onClick={handlePay}
        disabled={!stripe || loading}
        className="w-full bg-primary text-primary-foreground h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {loading
          ? <><Loader2 size={16} className="animate-spin" /> Processing…</>
          : <><Lock size={14} /> Pay AED {amount}</>
        }
      </button>

      <div className="flex items-center justify-center gap-1.5">
        <Lock size={10} className="text-muted-foreground" />
        <p className="text-[10px] text-muted-foreground">Secured by Stripe · PCI-DSS Level 1</p>
      </div>
    </div>
  );
}

export default function PaymentPanel({ bookingId, amount }: Props) {
  const [clientSecret, setClientSecret] = useState('');
  const [loadingIntent, setLoadingIntent] = useState(true);
  const [intentError, setIntentError]   = useState('');

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      setIntentError('Payment not configured yet.');
      setLoadingIntent(false);
      return;
    }

    fetch('/api/payment/intent', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ bookingId }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.clientSecret) setClientSecret(d.clientSecret);
        else setIntentError(d.error ?? 'Failed to initialise payment.');
      })
      .catch(() => setIntentError('Network error. Try again.'))
      .finally(() => setLoadingIntent(false));
  }, [bookingId]);

  if (loadingIntent) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 size={20} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (intentError) {
    return <p className="text-sm text-muted-foreground text-center py-4">{intentError}</p>;
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'flat',
          variables: {
            colorPrimary:    '#5A9E8F',
            borderRadius:    '10px',
            fontFamily:      'Inter, system-ui, sans-serif',
          },
        },
      }}
    >
      <CheckoutForm amount={amount} />
    </Elements>
  );
}
