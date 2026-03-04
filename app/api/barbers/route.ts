import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const active = request.nextUrl.searchParams.get("active");

    const where = active === "true" ? { active: true } : {};

    const barbers = await prisma.barber.findMany({
      where,
      orderBy: { name: "asc" },
    });

    return NextResponse.json(barbers);
  } catch (error) {
    console.error("GET /api/barbers error:", error);
    return NextResponse.json(
      { error: "Error al obtener barberos" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "El campo 'name' es requerido" },
        { status: 400 },
      );
    }

    const barber = await prisma.barber.create({
      data: { name: name.trim() },
    });

    return NextResponse.json(barber, { status: 201 });
  } catch (error) {
    console.error("POST /api/barbers error:", error);
    return NextResponse.json(
      { error: "Error al crear barbero" },
      { status: 500 },
    );
  }
}
