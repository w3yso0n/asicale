import { prisma } from "@/lib/prisma";

export interface ScheduleDay {
  dayOfWeek: number;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

const SCHEDULE_KEY = "schedule";

export const DEFAULT_SCHEDULE: ScheduleDay[] = [
  { dayOfWeek: 0, isOpen: false, openTime: "09:00", closeTime: "19:00" },
  { dayOfWeek: 1, isOpen: true, openTime: "09:00", closeTime: "19:00" },
  { dayOfWeek: 2, isOpen: true, openTime: "09:00", closeTime: "19:00" },
  { dayOfWeek: 3, isOpen: true, openTime: "09:00", closeTime: "19:00" },
  { dayOfWeek: 4, isOpen: true, openTime: "09:00", closeTime: "19:00" },
  { dayOfWeek: 5, isOpen: true, openTime: "09:00", closeTime: "19:00" },
  { dayOfWeek: 6, isOpen: true, openTime: "09:00", closeTime: "19:00" },
];

export async function getSchedule(): Promise<ScheduleDay[]> {
  try {
    const row = await prisma.appSetting.findUnique({
      where: { id: SCHEDULE_KEY },
    });
    if (!row?.value) return DEFAULT_SCHEDULE;
    const parsed = JSON.parse(row.value) as ScheduleDay[];
    return Array.isArray(parsed) && parsed.length === 7 ? parsed : DEFAULT_SCHEDULE;
  } catch {
    return DEFAULT_SCHEDULE;
  }
}

export async function setSchedule(schedule: ScheduleDay[]): Promise<ScheduleDay[]> {
  const sorted = [...schedule].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
  await prisma.appSetting.upsert({
    where: { id: SCHEDULE_KEY },
    create: { id: SCHEDULE_KEY, value: JSON.stringify(sorted) },
    update: { value: JSON.stringify(sorted) },
  });
  return sorted;
}
