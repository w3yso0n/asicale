import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, durationMin, price } = body;

    const data: Record<string, unknown> = {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json(
          { error: "El campo 'name' debe ser una cadena no vacía" },
          { status: 400 },
        );
      }
      data.name = name.trim();
    }

    if (durationMin !== undefined) {
      if (typeof durationMin !== "number" || durationMin <= 0) {
        return NextResponse.json(
          { error: "El campo 'durationMin' debe ser un número positivo" },
          { status: 400 },
        );
      }
      data.durationMin = durationMin;
    }

    if (price !== undefined) {
      if (typeof price !== "number" || price < 0) {
        return NextResponse.json(
          { error: "El campo 'price' debe ser un número no negativo" },
          { status: 400 },
        );
      }
      data.price = price;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "Se debe enviar al menos un campo para actualizar" },
        { status: 400 },
      );
    }

    const service = await prisma.service.update({
      where: { id },
      data,
    });

    return NextResponse.json(service);
  } catch (error: unknown) {
    const prismaError = error as { code?: string };
    if (prismaError.code === "P2025") {
      return NextResponse.json(
        { error: "Servicio no encontrado" },
        { status: 404 },
      );
    }
    console.error("PATCH /api/services/[id] error:", error);
    return NextResponse.json(
      { error: "Error al actualizar servicio" },
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

    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Servicio no encontrado" },
        { status: 404 },
      );
    }

    const scheduledCount = await prisma.appointment.count({
      where: { serviceId: id, status: "SCHEDULED" },
    });

    if (scheduledCount > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar un servicio con citas pendientes" },
        { status: 409 },
      );
    }

    await prisma.service.delete({ where: { id } });

    return NextResponse.json({ message: "Servicio eliminado" });
  } catch (error) {
    console.error("DELETE /api/services/[id] error:", error);
    return NextResponse.json(
      { error: "Error al eliminar servicio" },
      { status: 500 },
    );
  }
}
