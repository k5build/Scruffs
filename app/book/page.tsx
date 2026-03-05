import { Metadata } from 'next';
import { Suspense } from 'react';
import BookingWizard from '@/components/booking/BookingWizard';

export const metadata: Metadata = {
  title: 'Book a Grooming – Scruffs.ae',
  description: 'Book professional mobile pet grooming in Dubai. Choose your service, pick a time slot, and we\'ll come to you.',
};

export default function BookPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-scruffs-light flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-scruffs-teal border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <BookingWizard />
    </Suspense>
  );
}
