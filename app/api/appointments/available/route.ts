import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  parseISO,
  startOfDay,
  endOfDay,
  setHours,
  setMinutes,
  addMinutes,
  format,
  isBefore,
  getDay,
} from "date-fns";
import { readFile } from "fs/promises";
import path from "path";

interface ScheduleDay {
  dayOfWeek: number;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

const DEFAULT_SCHEDULE: ScheduleDay[] = [
  { dayOfWeek: 0, isOpen: false, openTime: "09:00", closeTime: "19:00" },
  { dayOfWeek: 1, isOpen: true, openTime: "09:00", closeTime: "19:00" },
  { dayOfWeek: 2, isOpen: true, openTime: "09:00", closeTime: "19:00" },
  { dayOfWeek: 3, isOpen: true, openTime: "09:00", closeTime: "19:00" },
  { dayOfWeek: 4, isOpen: true, openTime: "09:00", closeTime: "19:00" },
  { dayOfWeek: 5, isOpen: true, openTime: "09:00", closeTime: "19:00" },
  { dayOfWeek: 6, isOpen: true, openTime: "09:00", closeTime: "19:00" },
];

async function loadSchedule(): Promise<ScheduleDay[]> {
  try {
    const raw = await readFile(
      path.join(process.cwd(), "data", "schedule.json"),
      "utf-8",
    );
    return JSON.parse(raw) as ScheduleDay[];
  } catch {
    return DEFAULT_SCHEDULE;
  }
}

const SLOT_INTERVAL_MIN = 30;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const date = searchParams.get("date");
    const barberId = searchParams.get("barberId");
    const serviceId = searchParams.get("serviceId");

    if (!date || !barberId || !serviceId) {
      return NextResponse.json(
        { error: "Los parámetros 'date', 'barberId' y 'serviceId' son requeridos" },
        { status: 400 },
      );
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Servicio no encontrado" },
        { status: 404 },
      );
    }

    const parsed = parseISO(date);
    const dow = getDay(parsed);

    const schedule = await loadSchedule();
    const daySchedule = schedule.find((s) => s.dayOfWeek === dow);

    if (!daySchedule || !daySchedule.isOpen) {
      return NextResponse.json([]);
    }

    const [openH, openM] = daySchedule.openTime.split(":").map(Number);
    const [closeH, closeM] = daySchedule.closeTime.split(":").map(Number);

    const appointments = await prisma.appointment.findMany({
      where: {
        barberId,
        status: "SCHEDULED",
        startTime: { gte: startOfDay(parsed), lte: endOfDay(parsed) },
      },
      orderBy: { startTime: "asc" },
    });

    const dayStart = setMinutes(setHours(parsed, openH), openM);
    const dayEnd = setMinutes(setHours(parsed, closeH), closeM);

    const slots: { time: string; available: boolean }[] = [];
    let cursor = dayStart;

    while (isBefore(cursor, dayEnd)) {
      const slotEnd = addMinutes(cursor, service.durationMin);

      if (!isBefore(dayEnd, slotEnd)) {
        const hasConflict = appointments.some((appt) => {
          const apptStart = new Date(appt.startTime);
          const apptEnd = new Date(appt.endTime);
          return cursor < apptEnd && slotEnd > apptStart;
        });

        slots.push({
          time: format(cursor, "HH:mm"),
          available: !hasConflict,
        });
      }

      cursor = addMinutes(cursor, SLOT_INTERVAL_MIN);
    }

    return NextResponse.json(slots);
  } catch (error) {
    console.error("GET /api/appointments/available error:", error);
    return NextResponse.json(
      { error: "Error al obtener horarios disponibles" },
      { status: 500 },
    );
  }
}
