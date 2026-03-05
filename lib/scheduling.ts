import { addDays, format } from 'date-fns';
import { prisma } from './prisma';

/** Generate and upsert slots for the next N days */
export async function ensureSlotsExist(days = 90) {
  const DAILY_SLOTS = [
    { startTime: '09:00', endTime: '11:00' },
    { startTime: '11:30', endTime: '13:30' },
    { startTime: '14:00', endTime: '16:00' },
    { startTime: '16:30', endTime: '18:30' },
  ];

  const today = new Date();
  for (let i = 0; i < days; i++) {
    const date = format(addDays(today, i), 'yyyy-MM-dd');
    for (const slot of DAILY_SLOTS) {
      await prisma.timeSlot.upsert({
        where: { date_startTime: { date, startTime: slot.startTime } },
        update: {},
        create: { date, startTime: slot.startTime, endTime: slot.endTime },
      });
    }
  }
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
