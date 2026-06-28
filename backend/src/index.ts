import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

import authRoutes from "./routes/auth.routes";
import sessionRoutes from "./routes/session.routes";
import playerRoutes from "./routes/player.routes";
import attendanceRoutes from "./routes/attendance.routes";
import exportRoutes from "./routes/export.routes";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/export", exportRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Academy Tracker API running on port ${PORT}`);
});

export default app;
