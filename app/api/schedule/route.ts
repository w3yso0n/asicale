import { NextRequest, NextResponse } from "next/server";
import { getSchedule, setSchedule } from "@/lib/schedule";
import type { ScheduleDay } from "@/lib/schedule";

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
    const schedule = await getSchedule();
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

    const sorted = await setSchedule(body);
    return NextResponse.json(sorted);
  } catch (error) {
    console.error("PUT /api/schedule error:", error);
    return NextResponse.json(
      { error: "Error al guardar el horario" },
      { status: 500 },
    );
  }
}
