import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, notes } = body;

    const validStatuses = ["SCHEDULED", "COMPLETED", "CANCELLED", "NO_SHOW"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Estado inválido. Debe ser: SCHEDULED, COMPLETED, CANCELLED o NO_SHOW" },
        { status: 400 },
      );
    }

    if (!status && notes === undefined) {
      return NextResponse.json(
        { error: "Debe enviar al menos 'status' o 'notes'" },
        { status: 400 },
      );
    }

    const existing = await prisma.appointment.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Cita no encontrada" },
        { status: 404 },
      );
    }

    const data: Record<string, unknown> = {};
    if (status) data.status = status;
    if (notes !== undefined) data.notes = notes;

    const appointment = await prisma.appointment.update({
      where: { id },
      data,
      include: {
        customer: true,
        barber: true,
        service: true,
      },
    });

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("PATCH /api/appointments/[id] error:", error);
    return NextResponse.json(
      { error: "Error al actualizar cita" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const existing = await prisma.appointment.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Cita no encontrada" },
        { status: 404 },
      );
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status: "CANCELLED" },
      include: {
        customer: true,
        barber: true,
        service: true,
      },
    });

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("DELETE /api/appointments/[id] error:", error);
    return NextResponse.json(
      { error: "Error al cancelar cita" },
      { status: 500 },
    );
  }
}
