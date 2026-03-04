import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, parseISO, addMinutes } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const date = searchParams.get("date");
    const barberId = searchParams.get("barberId");
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};

    if (date) {
      const parsed = parseISO(date);
      where.startTime = {
        gte: startOfDay(parsed),
        lte: endOfDay(parsed),
      };
    }

    if (barberId) {
      where.barberId = barberId;
    }

    if (status) {
      where.status = status;
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        customer: true,
        barber: true,
        service: true,
      },
      orderBy: { startTime: "asc" },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("GET /api/appointments error:", error);
    return NextResponse.json(
      { error: "Error al obtener citas" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, barberId, serviceId, startTime, notes } = body;

    if (!customerId || !barberId || !serviceId || !startTime) {
      return NextResponse.json(
        {
          error:
            "Los campos customerId, barberId, serviceId y startTime son requeridos",
        },
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

    const start = new Date(startTime);
    const end = addMinutes(start, service.durationMin);

    const conflict = await prisma.appointment.findFirst({
      where: {
        barberId,
        status: "SCHEDULED",
        startTime: { lt: end },
        endTime: { gt: start },
      },
    });

    if (conflict) {
      return NextResponse.json(
        { error: "Conflicto de horario: el barbero ya tiene una cita en ese rango" },
        { status: 409 },
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        customerId,
        barberId,
        serviceId,
        startTime: start,
        endTime: end,
        notes: notes ?? null,
      },
      include: {
        customer: true,
        barber: true,
        service: true,
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error("POST /api/appointments error:", error);
    return NextResponse.json(
      { error: "Error al crear cita" },
      { status: 500 },
    );
  }
}
