export type PetType    = 'DOG' | 'CAT';
export type PetSize    = 'SMALL' | 'MEDIUM' | 'LARGE';
export type ServiceKey = 'BASIC' | 'SPECIAL' | 'FULL';
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

  // Step 2 – Service & When
  service:       ServiceKey | null;
  price:         number;
  duration:      number;  // minutes
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
