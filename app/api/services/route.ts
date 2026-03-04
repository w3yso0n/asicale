import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error("GET /api/services error:", error);
    return NextResponse.json(
      { error: "Error al obtener servicios" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, durationMin, price } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "El campo 'name' es requerido" },
        { status: 400 },
      );
    }

    if (!durationMin || typeof durationMin !== "number" || durationMin <= 0) {
      return NextResponse.json(
        { error: "El campo 'durationMin' debe ser un número positivo" },
        { status: 400 },
      );
    }

    if (price == null || typeof price !== "number" || price < 0) {
      return NextResponse.json(
        { error: "El campo 'price' debe ser un número no negativo" },
        { status: 400 },
      );
    }

    const service = await prisma.service.create({
      data: {
        name: name.trim(),
        durationMin,
        price,
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error("POST /api/services error:", error);
    return NextResponse.json(
      { error: "Error al crear servicio" },
      { status: 500 },
    );
  }
}
