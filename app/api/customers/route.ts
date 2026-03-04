import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const phone = request.nextUrl.searchParams.get("phone");

    if (!phone) {
      return NextResponse.json(
        { error: "El parámetro 'phone' es requerido" },
        { status: 400 },
      );
    }

    const customer = await prisma.customer.findUnique({
      where: { phone },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error("GET /api/customers error:", error);
    return NextResponse.json(
      { error: "Error al buscar cliente" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "El campo 'name' es requerido" },
        { status: 400 },
      );
    }

    if (!phone || typeof phone !== "string") {
      return NextResponse.json(
        { error: "El campo 'phone' es requerido" },
        { status: 400 },
      );
    }

    const existing = await prisma.customer.findUnique({
      where: { phone },
    });

    if (existing) {
      return NextResponse.json(existing);
    }

    const customer = await prisma.customer.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error("POST /api/customers error:", error);
    return NextResponse.json(
      { error: "Error al crear cliente" },
      { status: 500 },
    );
  }
}
