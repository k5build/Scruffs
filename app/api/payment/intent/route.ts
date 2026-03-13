import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rateLimit';
import { logger } from '@/lib/logger';

const SERVICE = 'payment-intent';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? 'unknown';

  // Rate limit: 5 payment intents per IP per 10 minutes
  const { allowed, retryAfter } = checkRateLimit(`${ip}:payment-intent`, 5, 10 * 60 * 1000);
  if (!allowed) {
    logger.warn(SERVICE, 'Rate limit hit on payment intent creation', { ip, action: 'payment.rate_limited' });
    return NextResponse.json(
      { error: 'Too many payment requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    );
  }

  try {
    const { bookingId } = await request.json() as { bookingId: string };

    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId required' }, { status: 400 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      logger.error(SERVICE, 'Stripe not configured — STRIPE_SECRET_KEY missing');
      return NextResponse.json({ error: 'Payment not configured' }, { status: 500 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-02-25.clover',
    });

    const booking = await prisma.booking.findUnique({
      where:  { id: bookingId },
      select: { id: true, bookingRef: true, petName: true, price: true, paymentStatus: true },
    });
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.paymentStatus === 'PAID') {
      return NextResponse.json({ error: 'Already paid' }, { status: 400 });
    }

    // Amount in fils (AED smallest unit is fils = 1/100)
    const amountInFils = Math.round(booking.price * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount:   amountInFils,
      currency: 'aed',
      metadata: {
        bookingId:  booking.id,
        bookingRef: booking.bookingRef,
        petName:    booking.petName,
      },
      description:               `Scruffs – ${booking.petName} grooming (${booking.bookingRef})`,
      automatic_payment_methods: { enabled: true },
    });

    // Store the PaymentIntent ID on the booking
    await prisma.booking.update({
      where: { id: bookingId },
      data:  { stripePaymentId: paymentIntent.id },
    });

    logger.info(SERVICE, 'Payment intent created', { bookingId, action: 'payment.intent_created', ip });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    logger.error(SERVICE, 'POST /api/payment/intent error', {
      error: err instanceof Error ? err.message : String(err),
      ip,
    });
    return NextResponse.json({ error: 'Failed to create payment intent' }, { status: 500 });
  }
}
