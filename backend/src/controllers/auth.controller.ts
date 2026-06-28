import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";

export const login = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: "Username and password are required" });
    return;
  }

  try {
    const coach = await prisma.coach.findUnique({ where: { username } });

    if (!coach) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const valid = await bcrypt.compare(password, coach.password);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      { id: coach.id, username: coach.username, ageGroup: coach.ageGroup },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "24h" }
    );

    res.json({
      token,
      coach: {
        id: coach.id,
        name: coach.name,
        username: coach.username,
        email: coach.email,
        ageGroup: coach.ageGroup,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const me = async (req: Request & { coach?: { id: string } }, res: Response): Promise<void> => {
  try {
    const coach = await prisma.coach.findUnique({
      where: { id: req.coach?.id },
      select: { id: true, name: true, username: true, email: true, ageGroup: true },
    });

    if (!coach) {
      res.status(404).json({ error: "Coach not found" });
      return;
    }

    res.json({ coach });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
};
