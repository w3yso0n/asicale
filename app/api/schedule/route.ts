import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";

export interface ScheduleDay {
  dayOfWeek: number;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const SCHEDULE_PATH = path.join(DATA_DIR, "schedule.json");

const DEFAULT_SCHEDULE: ScheduleDay[] = [
  { dayOfWeek: 0, isOpen: false, openTime: "09:00", closeTime: "19:00" },
  { dayOfWeek: 1, isOpen: true, openTime: "09:00", closeTime: "19:00" },
  { dayOfWeek: 2, isOpen: true, openTime: "09:00", closeTime: "19:00" },
  { dayOfWeek: 3, isOpen: true, openTime: "09:00", closeTime: "19:00" },
  { dayOfWeek: 4, isOpen: true, openTime: "09:00", closeTime: "19:00" },
  { dayOfWeek: 5, isOpen: true, openTime: "09:00", closeTime: "19:00" },
  { dayOfWeek: 6, isOpen: true, openTime: "09:00", closeTime: "19:00" },
];

async function readSchedule(): Promise<ScheduleDay[]> {
  try {
    const raw = await readFile(SCHEDULE_PATH, "utf-8");
    return JSON.parse(raw) as ScheduleDay[];
  } catch {
    return DEFAULT_SCHEDULE;
  }
}

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function validateSchedule(data: unknown): data is ScheduleDay[] {
  if (!Array.isArray(data) || data.length !== 7) return false;

  return data.every(
    (d) =>
      typeof d.dayOfWeek === "number" &&
      d.dayOfWeek >= 0 &&
      d.dayOfWeek <= 6 &&
      typeof d.isOpen === "boolean" &&
      typeof d.openTime === "string" &&
      TIME_RE.test(d.openTime) &&
      typeof d.closeTime === "string" &&
      TIME_RE.test(d.closeTime) &&
      d.closeTime > d.openTime,
  );
}

export async function GET() {
  try {
    const schedule = await readSchedule();
    return NextResponse.json(schedule);
  } catch (error) {
    console.error("GET /api/schedule error:", error);
    return NextResponse.json(
      { error: "Error al obtener el horario" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    if (!validateSchedule(body)) {
      return NextResponse.json(
        {
          error:
            "Datos inválidos. Se requiere un array de 7 días con dayOfWeek (0-6), isOpen (boolean), openTime y closeTime (HH:mm, closeTime > openTime).",
        },
        { status: 400 },
      );
    }

    const sorted = [...body].sort((a, b) => a.dayOfWeek - b.dayOfWeek);

    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(SCHEDULE_PATH, JSON.stringify(sorted, null, 2), "utf-8");

    return NextResponse.json(sorted);
  } catch (error) {
    console.error("PUT /api/schedule error:", error);
    return NextResponse.json(
      { error: "Error al guardar el horario" },
      { status: 500 },
    );
  }
}
