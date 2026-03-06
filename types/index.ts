export type PetType    = 'DOG' | 'CAT';
export type PetSize    = 'SMALL' | 'MEDIUM' | 'LARGE' | 'XL';
export type ServiceKey = 'WASH_TIDY';
export type AddOnKey   =
  | 'TRIM'              // Full Groom (Trimming)
  | 'BUNDLE'            // Full Groom Bundle (Trim + Nails + Teeth)
  | 'NAIL_GRIND'        // Nail Grind (Dremel)
  | 'TOOTH_BRUSH'       // Tooth Brushing
  | 'MEDICATED_SHAMPOO' // Medicated / Flea Shampoo
  | 'DEMATTING';        // De-matting (per 10 min)
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface SavedPet {
  id:    string;
  name:  string;
  type:  PetType;
  breed: string;
  size:  PetSize | null;
  age:   string;
  notes: string;
}

export interface TimeSlot {
  id:          string;
  date:        string;
  startTime:   string;
  endTime:     string;
  isAvailable: boolean;
}

export interface BookingData {
  // Step 1 – Pet
  petType:  PetType | null;
  petSize:  PetSize | null;
  petName:  string;
  petBreed: string;
  petAge:   string;
  petNotes: string;
  savedPetId: string;

  // Step 2 – Service & Add-ons & When
  service:       ServiceKey | null;   // always 'WASH_TIDY'
  addons:        AddOnKey[];          // selected add-ons
  basePrice:     number;              // base Wash & Tidy price
  addonsPrice:   number;              // sum of add-on prices
  price:         number;              // total = basePrice + addonsPrice
  duration:      number;              // minutes
  slotId:        string;
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
  { id: 1, label: 'Pet',      description: 'Who\'s getting groomed?' },
  { id: 2, label: 'Service',  description: 'Choose service & time'   },
  { id: 3, label: 'Location', description: 'Where are you?'          },
  { id: 4, label: 'Confirm',  description: 'Review & book'           },
];
