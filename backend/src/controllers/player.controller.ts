import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

type AttendanceRecord = { status: string; [key: string]: unknown };

export const getPlayers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const coach = req.coach!;

    const players = await prisma.player.findMany({
      where: { ageGroup: coach.ageGroup },
      include: {
        attendances: {
          include: { session: true },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { name: "asc" },
    });

    // Compute stats
    const playersWithStats = players.map((player: typeof players[0]) => {
      const regularUsed = (player.attendances as AttendanceRecord[]).filter(
        (a) => a.status === "PRESENT_REGULAR"
      ).length;
      const complementaryUsed = (player.attendances as AttendanceRecord[]).filter(
        (a) => a.status === "PRESENT_COMPLEMENTARY"
      ).length;
      const totalAttended = regularUsed + complementaryUsed;
      const attendanceRate =
        player.bookedSessions > 0
          ? Math.round((totalAttended / player.bookedSessions) * 100)
          : 0;

      return {
        ...player,
        stats: {
          regularUsed,
          complementaryUsed,
          totalAttended,
          bookedSessions: player.bookedSessions,
          maxComplementary: player.maxComplementary,
          remainingRegular: Math.max(0, player.bookedSessions - regularUsed),
          remainingComplementary: Math.max(0, player.maxComplementary - complementaryUsed),
          attendanceRate,
        },
      };
    });

    res.json({ players: playersWithStats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getPlayerById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const coach = req.coach!;

  try {
    const player = await prisma.player.findFirst({
      where: { id, ageGroup: coach.ageGroup },
      include: {
        attendances: {
          include: { session: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!player) {
      res.status(404).json({ error: "Player not found" });
      return;
    }

    const regularUsed = (player.attendances as AttendanceRecord[]).filter((a) => a.status === "PRESENT_REGULAR").length;
    const complementaryUsed = (player.attendances as AttendanceRecord[]).filter(
      (a) => a.status === "PRESENT_COMPLEMENTARY"
    ).length;

    res.json({
      player: {
        ...player,
        stats: {
          regularUsed,
          complementaryUsed,
          totalAttended: regularUsed + complementaryUsed,
          bookedSessions: player.bookedSessions,
          maxComplementary: player.maxComplementary,
          remainingRegular: Math.max(0, player.bookedSessions - regularUsed),
          remainingComplementary: Math.max(0, player.maxComplementary - complementaryUsed),
        },
      },
    });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
};
