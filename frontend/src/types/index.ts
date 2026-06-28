export type SessionTime = "MORNING" | "EVENING";
export type AttendanceStatus = "PRESENT_REGULAR" | "PRESENT_COMPLEMENTARY" | "ABSENT";

export interface Coach {
  id: string;
  name: string;
  username: string;
  email: string;
  ageGroup: string;
}

export interface Player {
  id: string;
  name: string;
  email?: string;
  ageGroup: string;
  bookedSessions: number;
  maxComplementary: number;
  coachId: string;
  stats?: PlayerStats;
  attendances?: Attendance[];
}

export interface PlayerStats {
  regularUsed: number;
  complementaryUsed: number;
  totalAttended: number;
  bookedSessions: number;
  maxComplementary: number;
  remainingRegular: number;
  remainingComplementary: number;
  attendanceRate: number;
}

export interface Session {
  id: string;
  date: string;
  time: SessionTime;
  ageGroup: string;
  coachId: string;
  attendances: Attendance[];
}

export interface Attendance {
  id: string;
  sessionId: string;
  playerId: string;
  status: AttendanceStatus;
  photoUrl?: string;
  notes?: string;
  markedAt?: string;
  player?: Player;
  session?: Session;
}
