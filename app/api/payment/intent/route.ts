import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { bookingId } = await request.json() as { bookingId: string };

    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId required' }, { status: 400 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Payment not configured' }, { status: 500 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-02-25.clover',
    });

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
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
      description: `Scruffs – ${booking.petName} grooming (${booking.bookingRef})`,
      automatic_payment_methods: { enabled: true },
    });

    // Store the PaymentIntent ID on the booking
    await prisma.booking.update({
      where: { id: bookingId },
      data:  { stripePaymentId: paymentIntent.id },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('POST /api/payment/intent:', err);
    return NextResponse.json({ error: 'Failed to create payment intent' }, { status: 500 });
  }
}
