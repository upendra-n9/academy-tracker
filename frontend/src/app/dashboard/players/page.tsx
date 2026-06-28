"use client";

import { useEffect, useState } from "react";
import { Player } from "@/types";
import api from "@/lib/api";
import { PlayerCard } from "@/components/coach/PlayerCard";
import { Users, Search, Download } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

export default function PlayersPage() {
  const { coach } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const res = await api.get("/players");
        setPlayers(res.data.players);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlayers();
  }, []);

  const filtered = players.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = async () => {
    try {
      const res = await api.get("/export/csv", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `attendance_${coach?.ageGroup}_${format(new Date(), "yyyy-MM-dd")}.csv`;
      a.click();
    } catch {}
  };

  const avgAttendance = players.length
    ? Math.round(
        players.reduce((acc, p) => acc + (p.stats?.attendanceRate || 0), 0) / players.length
      )
    : 0;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Players</h1>
          <p className="text-slate-500 mt-1">
            {coach?.ageGroup} group · {players.length} players · {avgAttendance}% avg attendance
          </p>
        </div>
        <button
          onClick={handleExport}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search players..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pitch-400"
        />
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-slate-100" />
                <div className="flex-1">
                  <div className="h-4 bg-slate-100 rounded w-32 mb-1.5" />
                  <div className="h-3 bg-slate-50 rounded w-20" />
                </div>
              </div>
              <div className="h-2 bg-slate-100 rounded-full" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500">No players found</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {filtered.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              onClick={() => setSelectedPlayer(player)}
            />
          ))}
        </div>
      )}

      {/* Player detail modal */}
      {selectedPlayer && (
        <PlayerDetailModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
      )}
    </div>
  );
}

function PlayerDetailModal({ player, onClose }: { player: Player; onClose: () => void }) {
  const [detail, setDetail] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/players/${player.id}`).then((r) => {
      setDetail(r.data.player);
      setLoading(false);
    });
  }, [player.id]);

  const statusColors: Record<string, string> = {
    PRESENT_REGULAR: "text-pitch-700 bg-pitch-50",
    PRESENT_COMPLEMENTARY: "text-amber-700 bg-amber-50",
    ABSENT: "text-red-700 bg-red-50",
  };

  const statusLabels: Record<string, string> = {
    PRESENT_REGULAR: "Regular",
    PRESENT_COMPLEMENTARY: "Comp.",
    ABSENT: "Absent",
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="pitch-header p-5 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg">
                {player.name[0]}
              </div>
              <div>
                <h2 className="font-bold text-white">{player.name}</h2>
                <p className="text-pitch-300 text-sm">{player.ageGroup} · {player.email || "No email"}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-pitch-300 hover:text-white p-1">✕</button>
          </div>
        </div>

        <div className="p-5">
          {/* Stats */}
          {player.stats && (
            <div className="grid grid-cols-3 gap-2 mb-5">
              {[
                {
                  label: "Regular",
                  value: `${player.stats.regularUsed}/${player.stats.bookedSessions}`,
                  color: "text-pitch-700",
                  bg: "bg-pitch-50",
                },
                {
                  label: "Comp.",
                  value: `${player.stats.complementaryUsed}/${player.stats.maxComplementary}`,
                  color: "text-amber-700",
                  bg: "bg-amber-50",
                },
                {
                  label: "Rate",
                  value: `${player.stats.attendanceRate}%`,
                  color:
                    player.stats.attendanceRate >= 70
                      ? "text-pitch-700"
                      : player.stats.attendanceRate >= 50
                      ? "text-amber-700"
                      : "text-red-700",
                  bg:
                    player.stats.attendanceRate >= 70
                      ? "bg-pitch-50"
                      : player.stats.attendanceRate >= 50
                      ? "bg-amber-50"
                      : "bg-red-50",
                },
              ].map((s) => (
                <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
                  <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Attendance history */}
          <h3 className="font-semibold text-slate-900 text-sm mb-3">Attendance History</h3>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-slate-50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {(detail?.attendances || [])
                .filter((a) => a.markedAt)
                .slice(0, 20)
                .map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-slate-50"
                  >
                    <div className="text-sm text-slate-700">
                      {att.session?.date
                        ? format(new Date(att.session.date), "MMM d")
                        : "—"}{" "}
                      <span className="text-slate-400 text-xs">
                        {att.session?.time === "MORNING" ? "AM" : "PM"}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        statusColors[att.status] || ""
                      }`}
                    >
                      {statusLabels[att.status] || att.status}
                    </span>
                  </div>
                ))}
              {(detail?.attendances || []).filter((a) => a.markedAt).length === 0 && (
                <p className="text-slate-400 text-sm text-center py-4">No attendance history</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
