import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { audit } from '@/lib/audit';

const SERVICE = 'stripe-webhook';

export async function POST(request: NextRequest) {
  // IMPORTANT: read body as text BEFORE any JSON parsing — stream can only be consumed once
  const body      = await request.text();
  const signature = request.headers.get('stripe-signature') ?? '';
  const secret    = process.env.STRIPE_WEBHOOK_SECRET ?? '';

  if (!secret || !process.env.STRIPE_SECRET_KEY) {
    logger.error(SERVICE, 'Stripe webhook not configured — missing env vars');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-02-25.clover',
  });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    logger.error(SERVICE, 'Stripe signature verification failed', {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent        = event.data.object as Stripe.PaymentIntent;
    const { bookingId } = intent.metadata;

    if (bookingId) {
      await prisma.booking.update({
        where: { id: bookingId },
        data:  { paymentStatus: 'PAID', stripePaymentId: intent.id },
      });

      await audit({
        action:   'payment.succeeded',
        actor:    'stripe',
        targetId: bookingId,
        details:  { stripePaymentIntentId: intent.id, amount: intent.amount, currency: intent.currency },
      });

      logger.info(SERVICE, 'Payment succeeded — booking marked PAID', {
        bookingId,
        action: 'payment.succeeded',
      });
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const intent        = event.data.object as Stripe.PaymentIntent;
    const { bookingId } = intent.metadata;
    if (bookingId) {
      logger.warn(SERVICE, 'Payment failed for booking', {
        bookingId,
        action: 'payment.failed',
      });
    }
  }

  return NextResponse.json({ received: true });
}
