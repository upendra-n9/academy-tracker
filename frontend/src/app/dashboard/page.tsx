"use client";

import { useEffect, useState } from "react";
import { Session } from "@/types";
import api from "@/lib/api";
import { SessionCard } from "@/components/coach/SessionCard";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { Calendar, Download, RefreshCw } from "lucide-react";

export default function DashboardPage() {
  const { coach } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSessions = async (quiet = false) => {
    if (!quiet) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await api.get("/sessions/today");
      setSessions(res.data.sessions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleExport = async () => {
    try {
      const res = await api.get("/export/csv", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `attendance_${coach?.ageGroup}_${format(new Date(), "yyyy-MM-dd")}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed", err);
    }
  };

  const todayLabel = format(new Date(), "EEEE, MMMM d, yyyy");
  const totalPlayers = sessions[0]?.attendances?.length ?? 0;
  const markedCount = sessions.reduce(
    (acc, s) => acc + s.attendances.filter((a) => a.markedAt).length,
    0
  );
  const totalSlots = sessions.reduce((acc, s) => acc + s.attendances.length, 0);

  return (
    <div>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
            <Calendar className="w-4 h-4" />
            <span>{todayLabel}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Today's Sessions</h1>
          <p className="text-slate-500 mt-1">
            {coach?.ageGroup} group · {totalPlayers} players
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchSessions(true)}
            disabled={refreshing}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats bar */}
      {!loading && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            {
              label: "Sessions Today",
              value: sessions.length,
              color: "text-slate-900",
              bg: "bg-white",
            },
            {
              label: "Players",
              value: totalPlayers,
              color: "text-slate-900",
              bg: "bg-white",
            },
            {
              label: "Slots Marked",
              value: `${markedCount}/${totalSlots}`,
              color: totalSlots > 0 && markedCount === totalSlots ? "text-pitch-700" : "text-amber-700",
              bg: totalSlots > 0 && markedCount === totalSlots ? "bg-pitch-50" : "bg-amber-50",
            },
          ].map((s) => (
            <div key={s.label} className={`card ${s.bg} p-4`}>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-slate-500 text-xs mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Sessions */}
      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-5 bg-slate-100 rounded w-32 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-16 bg-slate-50 rounded-xl" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="card p-12 text-center">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No sessions found for today.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onUpdate={() => fetchSessions(true)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

