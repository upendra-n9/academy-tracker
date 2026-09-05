import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import path from "path";
import fs from "fs";

export const markAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  const { sessionId, playerId, status, notes } = req.body;
  const coach = req.coach!;

  if (!sessionId || !playerId || !status) {
    res.status(400).json({ error: "sessionId, playerId, and status are required" });
    return;
  }

  const validStatuses = ["PRESENT_REGULAR", "PRESENT_COMPLEMENTARY", "ABSENT"];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }

  try {
    // Verify session belongs to coach's age group
    const session = await prisma.session.findFirst({
      where: { id: sessionId, ageGroup: coach.ageGroup },
    });

    if (!session) {
      res.status(403).json({ error: "Session not found or access denied" });
      return;
    }

    // Verify player belongs to coach's age group
    const player = await prisma.player.findFirst({
      where: { id: playerId, ageGroup: coach.ageGroup },
    });

    if (!player) {
      res.status(403).json({ error: "Player not found or access denied" });
      return;
    }

    // Check complementary limit
    if (status === "PRESENT_COMPLEMENTARY") {
      const compUsed = await prisma.attendance.count({
        where: { playerId, status: "PRESENT_COMPLEMENTARY" },
      });
      if (compUsed >= player.maxComplementary) {
        res.status(400).json({
          error: `Player has already used all ${player.maxComplementary} complementary sessions`,
        });
        return;
      }
    }

    const attendance = await prisma.attendance.upsert({
      where: { sessionId_playerId: { sessionId, playerId } },
      create: {
        sessionId,
        playerId,
        status,
        notes,
        markedAt: new Date(),
      },
      update: {
        status,
        notes,
        markedAt: new Date(),
      },
      include: { player: true, session: true },
    });

    res.json({ attendance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const uploadPhoto = async (req: AuthRequest, res: Response): Promise<void> => {
  const { attendanceId } = req.params;
  const { photoBase64, mimeType } = req.body;
  const coach = req.coach!;

  try {
    const attendance = await prisma.attendance.findFirst({
      where: { id: attendanceId },
      include: { session: true },
    });

    if (!attendance || attendance.session.ageGroup !== coach.ageGroup) {
      res.status(403).json({ error: "Attendance not found or access denied" });
      return;
    }

    if (!photoBase64) {
      res.status(400).json({ error: "Photo data is required" });
      return;
    }

    // Save base64 image to disk
    const uploadsDir = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const ext = mimeType === "image/png" ? "png" : "jpg";
    const filename = `attendance_${attendanceId}_${Date.now()}.${ext}`;
    const filepath = path.join(uploadsDir, filename);

    const base64Data = photoBase64.replace(/^data:image\/\w+;base64,/, "");
    fs.writeFileSync(filepath, Buffer.from(base64Data, "base64"));

    const photoUrl = `/uploads/${filename}`;

    const updated = await prisma.attendance.update({
      where: { id: attendanceId },
      data: { photoUrl },
      include: { player: true },
    });

    res.json({ attendance: updated, photoUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const bulkMarkAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  const { sessionId, records } = req.body;
  const coach = req.coach!;

  if (!sessionId || !Array.isArray(records)) {
    res.status(400).json({ error: "sessionId and records array are required" });
    return;
  }

  try {
    const session = await prisma.session.findFirst({
      where: { id: sessionId, ageGroup: coach.ageGroup },
    });

    if (!session) {
      res.status(403).json({ error: "Session not found or access denied" });
      return;
    }

    const results = await Promise.all(
      records.map(async (r: { playerId: string; status: string; notes?: string }) => {
        return prisma.attendance.upsert({
          where: { sessionId_playerId: { sessionId, playerId: r.playerId } },
          create: {
            sessionId,
            playerId: r.playerId,
            status: r.status as any,
            notes: r.notes,
            markedAt: new Date(),
          },
          update: {
            status: r.status as any,
            notes: r.notes,
            markedAt: new Date(),
          },
        });
      })
    );

    res.json({ updated: results.length, records: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

