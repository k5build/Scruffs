import { prisma } from './prisma';

const WORK_START    = 10 * 60;  // 10:00 in minutes
const WORK_END      = 20 * 60;  // 20:00 in minutes
const SLOT_INTERVAL = 30;       // every 30 min
const BUFFER_MINS   = 15;       // buffer between bookings

function timeToMins(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function minsToTime(m: number): string {
  const h   = Math.floor(m / 60);
  const min = m % 60;
  return `${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
}

/** Dynamically compute available start times for a date given a total duration */
export async function getAvailableStartTimes(
  date: string,
  requestedDuration: number
): Promise<{ startTime: string; endTime: string }[]> {
  // Get all active bookings for this date with their slot info
  const bookings = await prisma.booking.findMany({
    where: {
      slot: { date },
      status: { notIn: ['CANCELLED'] },
    },
    include: { slot: true },
  });

  // Build blocked time windows [start, end+buffer] in minutes
  const blocked = bookings.map((b) => ({
    start: timeToMins(b.slot.startTime),
    end:   timeToMins(b.slot.startTime) + b.duration + BUFFER_MINS,
  }));

  const results: { startTime: string; endTime: string }[] = [];

  for (let t = WORK_START; t + requestedDuration <= WORK_END; t += SLOT_INTERVAL) {
    const slotEnd = t + requestedDuration;
    const hasConflict = blocked.some(({ start, end }) => t < end && slotEnd > start);
    if (!hasConflict) {
      results.push({ startTime: minsToTime(t), endTime: minsToTime(slotEnd) });
    }
  }

  return results;
}

/** Legacy: kept for any admin code that might call it */
export async function ensureSlotsExist(_date: string) {
  // No-op: slots are now created dynamically when bookings are made
}

export async function getAllSlotsForDate(date: string) {
  return prisma.timeSlot.findMany({
    where:   { date },
    include: { booking: true },
    orderBy: { startTime: 'asc' },
  });
}
