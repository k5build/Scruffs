import { PrismaClient } from '@prisma/client';
import { addDays, format } from 'date-fns';

const prisma = new PrismaClient();

// Scruffs works 7 days a week, 9 AM – 6:30 PM Dubai time
const DAILY_SLOTS = [
  { startTime: '09:00', endTime: '11:00' },
  { startTime: '11:30', endTime: '13:30' },
  { startTime: '14:00', endTime: '16:00' },
  { startTime: '16:30', endTime: '18:30' },
];

async function main() {
  console.log('🌱 Seeding time slots for the next 90 days...');

  const today = new Date();
  const slots: { date: string; startTime: string; endTime: string }[] = [];

  for (let i = 0; i < 90; i++) {
    const date = addDays(today, i);
    const dateStr = format(date, 'yyyy-MM-dd');

    for (const slot of DAILY_SLOTS) {
      slots.push({ date: dateStr, startTime: slot.startTime, endTime: slot.endTime });
    }
  }

  let created = 0;
  for (const slot of slots) {
    try {
      await prisma.timeSlot.upsert({
        where: { date_startTime: { date: slot.date, startTime: slot.startTime } },
        update: {},
        create: slot,
      });
      created++;
    } catch {
      // skip duplicates
    }
  }

  console.log(`✅ Created/verified ${created} time slots`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
