import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.appointment.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.barber.deleteMany({});

  const barbers = ["Christian", "Oscar"];

  for (const name of barbers) {
    await prisma.barber.create({
      data: { name, active: true },
    });
  }

  const services = [
    { name: "Corte Clásico", durationMin: 30, price: 120 },
    { name: "Corte + Barba", durationMin: 45, price: 180 },
    { name: "Diseño de Barba", durationMin: 30, price: 100 },
    { name: "Corte Infantil", durationMin: 25, price: 100 },
  ];

  for (const service of services) {
    await prisma.service.create({ data: service });
  }

  console.log("Seed completado: 2 barberos y 4 servicios creados.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
