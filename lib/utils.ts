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
   BASE SERVICE: Wash & Tidy
───────────────────────────────────────── */
export const BASE_SERVICE = {
  key:     'WASH_TIDY' as const,
  name:    'Wash & Tidy',
  tagline: 'Deep clean, blow dry & brush out',
  includes: [
    'Luxury Bath & Blow Dry',
    'Full Brush Out',
    'Ear Cleaning',
    'Paw Wipe & Cologne Finish',
  ],
};

// Legacy alias so admin pages / confirmation page still work
export const SERVICES = {
  WASH_TIDY: BASE_SERVICE,
  // keep old keys for historical bookings display
  BASIC:   { key: 'BASIC',   name: 'Wash & Tidy',  tagline: '', includes: [] },
  SPECIAL: { key: 'SPECIAL', name: 'Full Groom',    tagline: '', includes: [] },
  FULL:    { key: 'FULL',    name: 'Luxury Spa',    tagline: '', includes: [] },
} as const;

/* ─────────────────────────────────────────
   BASE PRICING  (AED, excl. VAT)
───────────────────────────────────────── */
export const BASE_PRICES: Record<string, Record<string, number>> = {
  DOG: { SMALL: 179, MEDIUM: 219, LARGE: 259, XL: 299 },
  CAT: { DEFAULT: 149 },
};

export function getBasePrice(petType: string, petSize: string | null): number {
  if (petType === 'CAT') return BASE_PRICES.CAT.DEFAULT;
  return BASE_PRICES.DOG[petSize ?? 'MEDIUM'] ?? 219;
}

// Legacy compat
export function getPrice(petType: string, petSize: string | null, _service: string): number {
  return getBasePrice(petType, petSize);
}

/* ─────────────────────────────────────────
   ADD-ONS  (AED, excl. VAT)
───────────────────────────────────────── */
export interface AddOnDef {
  key:         string;
  label:       string;
  description: string;
  priceDog:    number;
  priceCat:    number;
  extraMins:   number;
  category:    'upgrade' | 'care';
  exclusive?:  string[];  // keys that cannot be selected together
}

export const ADDONS: AddOnDef[] = [
  {
    key:         'TRIM',
    label:       'Full Groom (Trimming)',
    description: 'Breed-style haircut & scissor finish',
    priceDog:    90,
    priceCat:    120,
    extraMins:   30,
    category:    'upgrade',
    exclusive:   ['BUNDLE'],
  },
  {
    key:         'BUNDLE',
    label:       'Full Groom Bundle',
    description: 'Trimming + Nail Grind + Teeth Brushing',
    priceDog:    130,
    priceCat:    150,
    extraMins:   45,
    category:    'upgrade',
    exclusive:   ['TRIM', 'NAIL_GRIND', 'TOOTH_BRUSH'],
  },
  {
    key:         'NAIL_GRIND',
    label:       'Nail Grind (Dremel)',
    description: 'Smooth nails with electric file',
    priceDog:    29,
    priceCat:    29,
    extraMins:   10,
    category:    'care',
    exclusive:   ['BUNDLE'],
  },
  {
    key:         'TOOTH_BRUSH',
    label:       'Tooth Brushing',
    description: 'Fresh breath & dental hygiene',
    priceDog:    29,
    priceCat:    29,
    extraMins:   10,
    category:    'care',
    exclusive:   ['BUNDLE'],
  },
  {
    key:         'MEDICATED_SHAMPOO',
    label:       'Medicated / Flea Shampoo',
    description: 'Vet-grade treatment shampoo',
    priceDog:    39,
    priceCat:    39,
    extraMins:   10,
    category:    'care',
  },
  {
    key:         'DEMATTING',
    label:       'De-matting (per 10 min)',
    description: 'Gentle mat removal for long coats',
    priceDog:    39,
    priceCat:    39,
    extraMins:   10,
    category:    'care',
  },
];

export function getAddonPrice(addonKey: string, petType: string): number {
  const def = ADDONS.find((a) => a.key === addonKey);
  if (!def) return 0;
  return petType === 'CAT' ? def.priceCat : def.priceDog;
}

export function calcAddonsPrice(addonKeys: string[], petType: string): number {
  return addonKeys.reduce((sum, k) => sum + getAddonPrice(k, petType), 0);
}

/* ─────────────────────────────────────────
   DURATIONS (minutes)
───────────────────────────────────────── */
export const BASE_DURATIONS: Record<string, Record<string, number>> = {
  DOG: { SMALL: 60, MEDIUM: 75, LARGE: 90, XL: 120 },
  CAT: { DEFAULT: 60 },
};

export function getBaseDuration(petType: string, petSize: string | null): number {
  if (petType === 'CAT') return BASE_DURATIONS.CAT.DEFAULT;
  return BASE_DURATIONS.DOG[petSize ?? 'MEDIUM'] ?? 75;
}

export function calcTotalDuration(petType: string, petSize: string | null, addonKeys: string[]): number {
  const base  = getBaseDuration(petType, petSize);
  const extra = addonKeys.reduce((sum, k) => {
    const def = ADDONS.find((a) => a.key === k);
    return sum + (def?.extraMins ?? 0);
  }, 0);
  return base + extra;
}

// Legacy compat
export function getServiceDuration(petType: string, petSize: string | null, _service: string): number {
  return getBaseDuration(petType, petSize);
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
