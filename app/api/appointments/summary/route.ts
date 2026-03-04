import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSchedule } from "@/lib/schedule";
import {
  parseISO,
  addDays,
  startOfDay,
  endOfDay,
  setHours,
  setMinutes,
  addMinutes,
  format,
  isBefore,
  getDay,
} from "date-fns";

const SLOT_INTERVAL_MIN = 30;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const from = searchParams.get("from");
    const days = parseInt(searchParams.get("days") || "14", 10);
    const barberId = searchParams.get("barberId");
    const serviceId = searchParams.get("serviceId");

    if (!from || !barberId || !serviceId) {
      return NextResponse.json(
        { error: "Los parámetros 'from', 'barberId' y 'serviceId' son requeridos" },
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

    const startDate = parseISO(from);
    const endDate = addDays(startDate, days - 1);

    const appointments = await prisma.appointment.findMany({
      where: {
        barberId,
        status: "SCHEDULED",
        startTime: { gte: startOfDay(startDate), lte: endOfDay(endDate) },
      },
      orderBy: { startTime: "asc" },
    });

    const schedule = await getSchedule();
    const summary: Record<string, { total: number; available: number }> = {};

    for (let i = 0; i < days; i++) {
      const day = addDays(startDate, i);
      const dateStr = format(day, "yyyy-MM-dd");
      const dow = getDay(day);
      const daySchedule = schedule.find((s) => s.dayOfWeek === dow);

      if (!daySchedule || !daySchedule.isOpen) {
        summary[dateStr] = { total: 0, available: 0 };
        continue;
      }

      const [openH, openM] = daySchedule.openTime.split(":").map(Number);
      const [closeH, closeM] = daySchedule.closeTime.split(":").map(Number);

      const dayStart = setMinutes(setHours(day, openH), openM);
      const dayEnd = setMinutes(setHours(day, closeH), closeM);

      const dayAppointments = appointments.filter((a) => {
        const d = format(new Date(a.startTime), "yyyy-MM-dd");
        return d === dateStr;
      });

      let totalSlots = 0;
      let availableSlots = 0;
      let cursor = dayStart;

      while (isBefore(cursor, dayEnd)) {
        const slotEnd = addMinutes(cursor, service.durationMin);

        if (!isBefore(dayEnd, slotEnd)) {
          totalSlots++;
          const hasConflict = dayAppointments.some((appt) => {
            const apptStart = new Date(appt.startTime);
            const apptEnd = new Date(appt.endTime);
            return cursor < apptEnd && slotEnd > apptStart;
          });
          if (!hasConflict) availableSlots++;
        }

        cursor = addMinutes(cursor, SLOT_INTERVAL_MIN);
      }

      summary[dateStr] = { total: totalSlots, available: availableSlots };
    }

    return NextResponse.json(summary);
  } catch (error) {
    console.error("GET /api/appointments/summary error:", error);
    return NextResponse.json(
      { error: "Error al obtener resumen de disponibilidad" },
      { status: 500 },
    );
  }
}
