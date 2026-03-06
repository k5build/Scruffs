import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const body      = await request.text();
  const signature = request.headers.get('stripe-signature') ?? '';
  const secret    = process.env.STRIPE_WEBHOOK_SECRET ?? '';

  if (!secret || !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-02-25.clover',
  });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    console.error('[Stripe Webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent  = event.data.object as Stripe.PaymentIntent;
    const { bookingId } = intent.metadata;

    if (bookingId) {
      await prisma.booking.update({
        where: { id: bookingId },
        data:  { paymentStatus: 'PAID', stripePaymentId: intent.id },
      });
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const intent    = event.data.object as Stripe.PaymentIntent;
    const { bookingId } = intent.metadata;
    if (bookingId) {
      console.warn(`[Stripe] Payment failed for booking ${bookingId}`);
    }
  }

  return NextResponse.json({ received: true });
}
