import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.barber.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Barbero no encontrado" },
        { status: 404 },
      );
    }

    const data: Record<string, unknown> = {};
    if (typeof body.active === "boolean") data.active = body.active;
    if (typeof body.name === "string") data.name = body.name.trim();

    const barber = await prisma.barber.update({
      where: { id },
      data,
    });

    return NextResponse.json(barber);
  } catch (error) {
    console.error("PATCH /api/barbers/[id] error:", error);
    return NextResponse.json(
      { error: "Error al actualizar barbero" },
      { status: 500 },
    );
  }
}
