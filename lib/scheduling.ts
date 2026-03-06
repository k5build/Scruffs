import { prisma } from './prisma';

const DAILY_SLOTS = [
  { startTime: '09:00', endTime: '11:00' },
  { startTime: '11:30', endTime: '13:30' },
  { startTime: '14:00', endTime: '16:00' },
  { startTime: '16:30', endTime: '18:30' },
];

/** Ensure the 4 default slots exist for a specific date (parallel upserts) */
export async function ensureSlotsExist(date: string) {
  await Promise.all(
    DAILY_SLOTS.map((slot) =>
      prisma.timeSlot.upsert({
        where:  { date_startTime: { date, startTime: slot.startTime } },
        update: {},
        create: { date, startTime: slot.startTime, endTime: slot.endTime },
      })
    )
  );
}

/** Get available slots for a given date */
export async function getAvailableSlots(date: string) {
  return prisma.timeSlot.findMany({
    where: { date, isAvailable: true, booking: null },
    orderBy: { startTime: 'asc' },
  });
}

/** Get all slots for a date (admin view) */
export async function getAllSlotsForDate(date: string) {
  return prisma.timeSlot.findMany({
    where: { date },
    include: { booking: true },
    orderBy: { startTime: 'asc' },
  });
}
