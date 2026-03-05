import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Generate booking reference e.g. SCR-20240315-A4X2 */
export function generateBookingRef(): string {
  const date = format(new Date(), 'yyyyMMdd');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SCR-${date}-${rand}`;
}

/** Format AED price */
export function formatPrice(aed: number): string {
  return `AED ${aed.toLocaleString('en-AE')}`;
}

/** Format date string "2024-03-15" → "Friday, 15 March 2024" */
export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'EEEE, d MMMM yyyy');
}

/** Format "09:00" → "9:00 AM" */
export function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hour}:${m.toString().padStart(2, '0')} ${suffix}`;
}

/** Add minutes to "HH:MM" → "HH:MM" */
export function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${nh.toString().padStart(2, '0')}:${nm.toString().padStart(2, '0')}`;
}

/** Dubai service areas */
export const DUBAI_AREAS = [
  'Downtown Dubai',
  'Dubai Marina',
  'Jumeirah Beach Residence (JBR)',
  'Palm Jumeirah',
  'Jumeirah 1',
  'Jumeirah 2',
  'Jumeirah 3',
  'Al Barsha',
  'Business Bay',
  'DIFC',
  'City Walk',
  'Deira',
  'Bur Dubai',
  'Karama',
  'Al Qusais',
  'Mirdif',
  'Arabian Ranches',
  'Jumeirah Village Circle (JVC)',
  'Jumeirah Village Triangle (JVT)',
  'The Springs',
  'The Meadows',
  'The Lakes',
  'Emirates Hills',
  'Al Sufouh',
  'Knowledge Village',
  'Dubai Silicon Oasis',
  'Al Furjan',
  'Discovery Gardens',
  'International City',
  'Dubai Sports City',
  'Mudon',
  'Damac Hills',
  'Dubailand',
  'Nad Al Sheba',
  'Oud Metha',
  'Umm Suqeim',
  'Al Safa',
  'Satwa',
  'Al Wasl',
  'Jumeirah Park',
  'The Greens',
  'The Views',
  'Al Quoz',
  'Dubai Festival City',
  'Garhoud',
  'Port Saeed',
  'Al Nahda',
  'Rashidiya',
  'Other',
];

/* ─────────────────────────────────────────
   SERVICE DEFINITIONS
   Service keys: BASIC | SPECIAL | FULL
   Renamed for the UI as:
     BASIC   → Bath & Brush
     SPECIAL → Full Groom
     FULL    → Luxury Spa
───────────────────────────────────────── */
export const SERVICES = {
  BASIC: {
    key:      'BASIC',
    name:     'Bath & Brush',
    tagline:  'Squeaky clean & fresh',
    icon:     'bath',
    includes: [
      'Bath & Blow Dry',
      'Full Brush Out',
      'Nail Trim & File',
      'Ear Cleaning',
      'Cologne Finish',
    ],
    color: '#E8F0EF',
    accent: '#A3C0BE',
  },
  SPECIAL: {
    key:      'SPECIAL',
    name:     'Full Groom',
    tagline:  'Head-to-paw perfection',
    icon:     'scissors',
    includes: [
      'Everything in Bath & Brush',
      'Haircut & Breed Styling',
      'Teeth Brushing',
      'Paw Balm Treatment',
      'Bandana / Bow',
    ],
    popular: true,
    color: '#EBF0EC',
    accent: '#3A4F4A',
  },
  FULL: {
    key:      'FULL',
    name:     'Luxury Spa',
    tagline:  'The royal treatment',
    icon:     'sparkles',
    includes: [
      'Everything in Full Groom',
      'De-Shedding Treatment',
      'Blueberry Facial',
      'Deep Coat Conditioning',
      'Paw Massage',
      'Luxury Gift Pack',
    ],
    color: '#F4F0E8',
    accent: '#B8960C',
  },
} as const;

/* ─────────────────────────────────────────
   PRICING  (AED)
   Verified Dubai market rates 2024
───────────────────────────────────────── */
export const PRICING: Record<string, Record<string, Record<string, number>>> = {
  DOG: {
    SMALL:  { BASIC: 150, SPECIAL: 250, FULL: 350 },
    MEDIUM: { BASIC: 200, SPECIAL: 300, FULL: 450 },
    LARGE:  { BASIC: 250, SPECIAL: 380, FULL: 580 },
  },
  CAT: {
    DEFAULT: { BASIC: 180, SPECIAL: 280, FULL: 380 },
  },
};

export function getPrice(petType: string, petSize: string | null, service: string): number {
  if (petType === 'CAT') return PRICING.CAT.DEFAULT[service] ?? 0;
  const size = petSize ?? 'MEDIUM';
  return PRICING.DOG[size]?.[service] ?? 0;
}

/* ─────────────────────────────────────────
   SERVICE DURATIONS (minutes)
   Based on breed size + service type
───────────────────────────────────────── */
export const SERVICE_DURATIONS: Record<string, Record<string, Record<string, number>>> = {
  DOG: {
    SMALL:  { BASIC: 60,  SPECIAL: 90,  FULL: 120 },
    MEDIUM: { BASIC: 90,  SPECIAL: 120, FULL: 150 },
    LARGE:  { BASIC: 120, SPECIAL: 150, FULL: 180 },
  },
  CAT: {
    DEFAULT: { BASIC: 60, SPECIAL: 90, FULL: 120 },
  },
};

export function getServiceDuration(petType: string, petSize: string | null, service: string): number {
  if (petType === 'CAT') return SERVICE_DURATIONS.CAT.DEFAULT[service] ?? 60;
  const size = petSize ?? 'MEDIUM';
  return SERVICE_DURATIONS.DOG[size]?.[service] ?? 60;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}min` : `${h} ${h === 1 ? 'hour' : 'hours'}`;
}

/* ─────────────────────────────────────────
   WHATSAPP
───────────────────────────────────────── */
export const BUSINESS_WHATSAPP = '971501234567';

export function buildBookingWhatsApp(booking: {
  bookingRef: string;
  petName: string;
  petBreed: string;
  petSize?: string | null;
  service: string;
  price: number;
  slotDate: string;
  slotStartTime: string;
  area: string;
  address: string;
  ownerName: string;
  ownerPhone: string;
  duration: number;
}): string {
  const serviceName = SERVICES[booking.service as keyof typeof SERVICES]?.name ?? booking.service;
  const msg = `Hi Scruffs! My booking is confirmed.

Ref: ${booking.bookingRef}
Pet: ${booking.petName} (${booking.petBreed}${booking.petSize ? ', ' + booking.petSize : ''})
Service: ${serviceName}
Date: ${formatDate(booking.slotDate)}
Time: ${formatTime(booking.slotStartTime)} (~${formatDuration(booking.duration)})
Location: ${booking.area}, ${booking.address}
Price: ${formatPrice(booking.price)}

Please confirm. Thank you!`;

  return `https://wa.me/${BUSINESS_WHATSAPP}?text=${encodeURIComponent(msg)}`;
}

/* ─────────────────────────────────────────
   DOG BREEDS
───────────────────────────────────────── */
export const DOG_BREEDS = [
  'Labrador Retriever', 'Golden Retriever', 'German Shepherd',
  'French Bulldog', 'English Bulldog', 'Poodle (Standard)',
  'Poodle (Miniature)', 'Poodle (Toy)', 'Beagle', 'Rottweiler',
  'Yorkshire Terrier', 'Boxer', 'Dachshund', 'Siberian Husky',
  'Maltese', 'Shih Tzu', 'Chihuahua', 'Border Collie',
  'Cocker Spaniel', 'Doberman', 'Great Dane', 'Chow Chow',
  'Samoyed', 'Corgi', 'Pomeranian', 'Bichon Frise',
  'Afghan Hound', 'Akita', 'Alaskan Malamute', 'Bernese Mountain Dog',
  'Mixed Breed', 'Other',
];

export const CAT_BREEDS = [
  'Persian', 'Maine Coon', 'Ragdoll', 'Siamese', 'British Shorthair',
  'Scottish Fold', 'Sphynx', 'Russian Blue', 'Birman', 'Bengal',
  'Norwegian Forest Cat', 'Abyssinian', 'Burmese', 'Exotic Shorthair',
  'Domestic Shorthair', 'Domestic Longhair', 'Mixed Breed', 'Other',
];

export const PET_AGE_OPTIONS = [
  '0–6 months (Puppy/Kitten)',
  '6–12 months',
  '1–2 years',
  '2–5 years',
  '5–8 years',
  '8+ years (Senior)',
];
