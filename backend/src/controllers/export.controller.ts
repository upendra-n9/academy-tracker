import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

export const exportAttendanceCSV = async (req: AuthRequest, res: Response): Promise<void> => {
  const coach = req.coach!;
  const { sessionId } = req.query;

  try {
    const whereClause: any = {
      session: { ageGroup: coach.ageGroup },
    };

    if (sessionId) {
      whereClause.sessionId = sessionId;
    }

    const attendances = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        player: true,
        session: true,
      },
      orderBy: [{ session: { date: "desc" } }, { player: { name: "asc" } }],
    });

    type AttendanceWithRelations = (typeof attendances)[0];
    type CsvRow = Record<string, string | number>;
    const rows: CsvRow[] = attendances.map((a: AttendanceWithRelations) => ({
      Date: a.session.date.toISOString().split("T")[0],
      Time: a.session.time,
      "Player Name": a.player.name,
      "Age Group": a.player.ageGroup,
      Status: a.status.replace(/_/g, " "),
      "Marked At": a.markedAt ? a.markedAt.toISOString() : "",
      Notes: a.notes || "",
      "Booked Sessions": a.player.bookedSessions,
    }));

    const headers = Object.keys(rows[0] || {});
    const csvLines = [
      headers.join(","),
      ...rows.map((row: CsvRow) =>
        headers
          .map((h) => {
            const val = String(row[h] ?? "");
            return val.includes(",") ? `"${val}"` : val;
          })
          .join(",")
      ),
    ];

    const csv = csvLines.join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="attendance_${coach.ageGroup}_${new Date().toISOString().split("T")[0]}.csv"`
    );
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

