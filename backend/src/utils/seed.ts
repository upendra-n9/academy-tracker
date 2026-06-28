import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean up
  await prisma.attendance.deleteMany();
  await prisma.session.deleteMany();
  await prisma.player.deleteMany();
  await prisma.coach.deleteMany();

  const passwordHash = await bcrypt.hash("coach123", 10);

  // Create coaches
  const coach1 = await prisma.coach.create({
    data: {
      username: "coach_junior",
      password: passwordHash,
      name: "Marcus Thompson",
      email: "marcus.thompson@academy.com",
      ageGroup: "U12",
    },
  });

  const coach2 = await prisma.coach.create({
    data: {
      username: "coach_senior",
      password: passwordHash,
      name: "Sarah Williams",
      email: "sarah.williams@academy.com",
      ageGroup: "U16",
    },
  });

  console.log(`✅ Created coaches: ${coach1.name}, ${coach2.name}`);

  // Create players for U12
  const u12Players = [
    { name: "Liam Carter", email: "liam.carter@mail.com" },
    { name: "Noah Patel", email: "noah.patel@mail.com" },
    { name: "Ethan Moore", email: "ethan.moore@mail.com" },
    { name: "Oliver Johnson", email: "oliver.j@mail.com" },
    { name: "Lucas Brown", email: "lucas.b@mail.com" },
  ];

  // Create players for U16
  const u16Players = [
    { name: "Aiden Wilson", email: "aiden.w@mail.com" },
    { name: "James Davis", email: "james.d@mail.com" },
    { name: "Benjamin Martinez", email: "ben.m@mail.com" },
    { name: "Mason Anderson", email: "mason.a@mail.com" },
    { name: "Elijah Taylor", email: "elijah.t@mail.com" },
  ];

  for (const p of u12Players) {
    await prisma.player.create({
      data: {
        ...p,
        ageGroup: "U12",
        coachId: coach1.id,
        bookedSessions: 12,
        maxComplementary: 3,
      },
    });
  }

  for (const p of u16Players) {
    await prisma.player.create({
      data: {
        ...p,
        ageGroup: "U16",
        coachId: coach2.id,
        bookedSessions: 12,
        maxComplementary: 3,
      },
    });
  }

  console.log("✅ Created 10 players (5 per age group)");

  // Create sessions for the past 7 days + today and seed some attendance
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const allU12Players = await prisma.player.findMany({ where: { ageGroup: "U12" } });
  const allU16Players = await prisma.player.findMany({ where: { ageGroup: "U16" } });

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    for (const time of ["MORNING", "EVENING"] as const) {
      // U12 session
      const s1 = await prisma.session.create({
        data: { date, time, ageGroup: "U12", coachId: coach1.id },
      });

      // U16 session
      const s2 = await prisma.session.create({
        data: { date, time, ageGroup: "U16", coachId: coach2.id },
      });

      // Seed attendance for past days (not today)
      if (i > 0) {
        const statuses = ["PRESENT_REGULAR", "PRESENT_REGULAR", "PRESENT_REGULAR", "PRESENT_REGULAR", "ABSENT"] as const;

        for (let pi = 0; pi < allU12Players.length; pi++) {
          await prisma.attendance.create({
            data: {
              sessionId: s1.id,
              playerId: allU12Players[pi].id,
              status: statuses[pi % statuses.length],
              markedAt: new Date(date),
            },
          });
        }

        for (let pi = 0; pi < allU16Players.length; pi++) {
          await prisma.attendance.create({
            data: {
              sessionId: s2.id,
              playerId: allU16Players[pi].id,
              status: statuses[pi % statuses.length],
              markedAt: new Date(date),
            },
          });
        }
      } else {
        // Create empty attendance records for today
        for (const p of allU12Players) {
          await prisma.attendance.create({
            data: { sessionId: s1.id, playerId: p.id },
          });
        }
        for (const p of allU16Players) {
          await prisma.attendance.create({
            data: { sessionId: s2.id, playerId: p.id },
          });
        }
      }
    }
  }

  console.log("✅ Created sessions and attendance history for the past 7 days");
  console.log("\n📋 Login credentials:");
  console.log("  Coach 1 - U12: username=coach_junior, password=coach123");
  console.log("  Coach 2 - U16: username=coach_senior, password=coach123");
  console.log("\n✨ Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
