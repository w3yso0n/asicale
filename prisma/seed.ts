import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const barbers = ["Carlos", "Miguel", "Roberto"];

  for (const name of barbers) {
    await prisma.barber.upsert({
      where: { id: name.toLowerCase() },
      update: {},
      create: { id: name.toLowerCase(), name, active: true },
    });
  }

  const services = [
    { id: "corte-clasico", name: "Corte Clásico", durationMin: 30, price: 15.0 },
    { id: "corte-barba", name: "Corte + Barba", durationMin: 45, price: 25.0 },
    { id: "afeitado", name: "Afeitado", durationMin: 20, price: 10.0 },
    { id: "diseno-barba", name: "Diseño de Barba", durationMin: 30, price: 18.0 },
    { id: "corte-infantil", name: "Corte Infantil", durationMin: 25, price: 12.0 },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { id: service.id },
      update: {},
      create: service,
    });
  }

  console.log("Seed completado: 3 barberos y 5 servicios creados.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
