import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

export const getTodaySessions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const coach = req.coach!;

    // Ensure today's sessions exist for this coach's age group
    await ensureTodaySessions(coach.id, coach.ageGroup, today);

    const sessions = await prisma.session.findMany({
      where: {
        date: today,
        ageGroup: coach.ageGroup,
        coachId: coach.id,
      },
      include: {
        attendances: {
          include: { player: true },
        },
      },
      orderBy: { time: "asc" },
    });

    res.json({ sessions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getSessionById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const coach = req.coach!;

  try {
    const session = await prisma.session.findFirst({
      where: { id, ageGroup: coach.ageGroup },
      include: {
        attendances: {
          include: { player: true },
        },
      },
    });

    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    res.json({ session });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
};

async function ensureTodaySessions(coachId: string, ageGroup: string, date: Date) {
  for (const time of ["MORNING", "EVENING"] as const) {
    await prisma.session.upsert({
      where: { date_time_ageGroup: { date, time, ageGroup } },
      create: { date, time, ageGroup, coachId },
      update: {},
    });
  }

  // Create attendance records for all players
  const session = await prisma.session.findMany({
    where: { date, ageGroup },
  });

  const players = await prisma.player.findMany({ where: { ageGroup } });

  for (const s of session) {
    for (const p of players) {
      await prisma.attendance.upsert({
        where: { sessionId_playerId: { sessionId: s.id, playerId: p.id } },
        create: { sessionId: s.id, playerId: p.id },
        update: {},
      });
    }
  }
}
