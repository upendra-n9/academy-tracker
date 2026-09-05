"use client";

import { Player } from "@/types";
import { AlertTriangle, TrendingUp } from "lucide-react";
import clsx from "clsx";

interface Props {
  player: Player;
  onClick: () => void;
}

export function PlayerCard({ player, onClick }: Props) {
  const stats = player.stats;
  const rate = stats?.attendanceRate ?? 0;
  const isLow = rate < 60;
  const regularPct = stats ? (stats.regularUsed / stats.bookedSessions) * 100 : 0;
  const compPct = stats ? (stats.complementaryUsed / stats.maxComplementary) * 100 : 0;

  return (
    <button
      onClick={onClick}
      className="card p-5 text-left hover:shadow-md transition-shadow hover:border-pitch-200 w-full"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={clsx(
              "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm",
              isLow ? "bg-red-100 text-red-700" : "bg-pitch-100 text-pitch-700"
            )}
          >
            {player.name[0]}
          </div>
          <div>
            <div className="font-semibold text-slate-900 text-sm">{player.name}</div>
            {player.email && (
              <div className="text-xs text-slate-400 truncate max-w-[140px]">{player.email}</div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {isLow && <AlertTriangle className="w-4 h-4 text-amber-500" />}
          <div
            className={clsx(
              "text-sm font-bold",
              rate >= 70 ? "text-pitch-600" : rate >= 50 ? "text-amber-600" : "text-red-600"
            )}
          >
            {rate}%
          </div>
        </div>
      </div>

      {stats && (
        <div className="space-y-2">
          {/* Regular sessions bar */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Regular sessions</span>
              <span className="font-medium text-slate-700">
                {stats.regularUsed}/{stats.bookedSessions}
              </span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-pitch-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, regularPct)}%` }}
              />
            </div>
          </div>

          {/* Complementary sessions */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Comp. sessions</span>
              <span className="font-medium text-slate-700">
                {stats.complementaryUsed}/{stats.maxComplementary}
              </span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all"
                style={{ width: `${Math.min(100, compPct)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-end mt-3">
        <span className="text-xs text-slate-400 flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5" />
          View history
        </span>
      </div>
    </button>
  );
}

