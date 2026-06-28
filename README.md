# ⚽ Academy Tracker — Football Club Attendance System

A full-stack attendance tracking system for a football club academy. Coaches log in and track player attendance across morning/evening sessions, capture group photos, monitor session stats, and export reports.

---

## 🚀 Quick Start (Docker)

The entire project runs with a single command:

```bash
docker-compose up --build
```

Then open:
- **Frontend** → http://localhost:3000
- **API** → http://localhost:4000/api/health

---

## 🔑 Demo Login Credentials

| Username | Password | Group |
|---|---|---|
| `coach_junior` | `coach123` | U12 |
| `coach_senior` | `coach123` | U16 |

---

## 🏗️ Architecture

```
academy-tracker/
├── backend/              # Node.js + Express + TypeScript API
│   ├── src/
│   │   ├── controllers/  # Route handlers
│   │   ├── middleware/   # JWT auth
│   │   ├── routes/       # Express routers
│   │   ├── config/       # Prisma client
│   │   └── utils/        # DB seed script
│   └── prisma/
│       ├── schema.prisma # Data models
│       └── migrations/   # SQL migrations
│
├── frontend/             # Next.js 14 + TypeScript + Tailwind CSS
│   └── src/
│       ├── app/          # Next.js App Router pages
│       ├── components/   # React components
│       ├── hooks/        # Auth context
│       ├── lib/          # Axios API client
│       └── types/        # TypeScript interfaces
│
└── docker-compose.yml    # Full stack orchestration
```

**Stack:**
- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL 16 + Prisma ORM
- **Auth:** JWT (24h expiry)
- **File Storage:** Local disk (base64 → file)

---

## ✅ Features Implemented

### Core
- [x] Coach login with JWT auth
- [x] Role-scoped data (coaches see only their age group)
- [x] Today's morning + evening sessions auto-created
- [x] Mark attendance: **Regular**, **Complementary**, or **Absent**
- [x] Complementary session limit enforced (max 3 per player)
- [x] Take/upload photo per attendance record (camera capture on mobile)
- [x] Per-player stats: booked sessions used, complementary used, attendance rate

### Bonus
- [x] **CSV export** of attendance data
- [x] **Player profile** with full attendance history modal
- [x] **Low attendance indicator** (flagged if < 60%)
- [x] **Dashboard stats** — sessions, players, marked count
- [x] **Dockerized** — single `docker-compose up --build` command
- [x] **Responsive** — works on mobile and desktop

---

## 💻 Local Development (without Docker)

### Prerequisites
- Node.js 20+
- PostgreSQL 16

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your DB connection

npm install
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:4000/api

npm install
npm run dev
```

---

## 📡 API Reference

All protected routes require: `Authorization: Bearer <token>`

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Login with username/password |
| GET | `/api/auth/me` | Get current coach profile |

### Sessions
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/sessions/today` | Get today's sessions (auto-creates if missing) |
| GET | `/api/sessions/:id` | Get session detail |

### Players
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/players` | List players in coach's age group with stats |
| GET | `/api/players/:id` | Player detail with full attendance history |

### Attendance
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/attendance/mark` | Mark single attendance |
| POST | `/api/attendance/bulk` | Bulk mark attendance |
| POST | `/api/attendance/:id/photo` | Upload attendance photo (base64) |

### Export
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/export/csv` | Export attendance as CSV |

---

## 🗄️ Data Model

```
Coach (1) ──── (N) Player
Coach (1) ──── (N) Session
Session (N) ── (N) Player  [via Attendance]

Attendance fields:
  - status: PRESENT_REGULAR | PRESENT_COMPLEMENTARY | ABSENT
  - photoUrl: string (optional)
  - markedAt: timestamp (null = not yet marked)
```

---

## 🌱 Seed Data

The seed creates:
- 2 coaches (U12 and U16)
- 10 players (5 per age group)
- 7 days of session history with realistic attendance data
- Today's sessions with empty attendance records ready to fill

---

## 🐳 Docker Notes

- Backend waits for Postgres healthcheck before starting
- Migrations run automatically on container start
- Seed runs once on first boot (fails silently on re-runs)
- Uploads persisted via Docker volume
- Frontend served as Next.js standalone build
