export type PetType      = 'DOG' | 'CAT';
export type PetSize      = 'SMALL' | 'MEDIUM' | 'LARGE' | 'XL';
export type ServiceLevel = 'BASIC' | 'SPECIAL' | 'FULL';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface BookingPetEntry {
  key:         string;        // crypto.randomUUID() for React key
  name:        string;
  type:        PetType;
  breed:       string;
  size:        PetSize | null;
  age:         string;
  notes:       string;
  service:     ServiceLevel;
  addons:      string[];      // add-on keys e.g. ['TRIM', 'NAIL_GRIND']
  price:       number;        // calculated (base + addons)
  duration:    number;        // calculated minutes (base + addons)
  savedPetId?: string;        // if loaded from saved pets
}

export interface SavedPet {
  id:    string;
  name:  string;
  type:  PetType;
  breed: string;
  size:  PetSize | null;
  age:   string;
  notes: string;
}

export interface VirtualSlot {
  startTime: string;  // "10:00"
  endTime:   string;  // "11:30"
}

export interface BookingData {
  // Step 1 – Multiple pets
  pets:     BookingPetEntry[];
  price:    number;   // total = sum of pet prices
  duration: number;   // total = sum of pet durations

  // Step 2 – Time slot
  slotDate:      string;
  slotStartTime: string;
  slotEndTime:   string;

  // Step 3 – Location
  area:         string;
  address:      string;
  buildingNote: string;
  mapsLink:     string;
  lat:          number | null;
  lng:          number | null;

  // Step 4 – Contact
  ownerName:  string;
  ownerEmail: string;
  ownerPhone: string;
}

export const BOOKING_STEPS = [
  { id: 1, label: 'Pets',     description: 'Who\'s getting groomed?' },
  { id: 2, label: 'Time',     description: 'Pick your time slot'     },
  { id: 3, label: 'Location', description: 'Where are you?'          },
  { id: 4, label: 'Confirm',  description: 'Review & book'           },
];
