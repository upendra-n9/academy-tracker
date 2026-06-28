"use client";

import { useState, useRef } from "react";
import { Session, Attendance, AttendanceStatus } from "@/types";
import { Camera, Check, X, Clock, ChevronDown, ChevronUp, Loader2, Image as ImageIcon } from "lucide-react";
import api from "@/lib/api";
import clsx from "clsx";

interface Props {
  session: Session;
  onUpdate: () => void;
}

const STATUS_LABELS: Record<AttendanceStatus, string> = {
  PRESENT_REGULAR: "Regular",
  PRESENT_COMPLEMENTARY: "Comp.",
  ABSENT: "Absent",
};

const STATUS_COLORS: Record<AttendanceStatus, string> = {
  PRESENT_REGULAR: "bg-pitch-500 text-white hover:bg-pitch-600",
  PRESENT_COMPLEMENTARY: "bg-amber-500 text-white hover:bg-amber-600",
  ABSENT: "bg-red-500 text-white hover:bg-red-600",
};

const STATUS_INACTIVE: Record<AttendanceStatus, string> = {
  PRESENT_REGULAR: "bg-pitch-50 text-pitch-700 hover:bg-pitch-100",
  PRESENT_COMPLEMENTARY: "bg-amber-50 text-amber-700 hover:bg-amber-100",
  ABSENT: "bg-red-50 text-red-700 hover:bg-red-100",
};

export function SessionCard({ session, onUpdate }: Props) {
  const [expanded, setExpanded] = useState(true);
  const [marking, setMarking] = useState<Record<string, boolean>>({});
  const [photoModal, setPhotoModal] = useState<Attendance | null>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const timeLabel = session.time === "MORNING" ? "☀️ Morning" : "🌙 Evening";
  const markedCount = session.attendances.filter((a) => a.markedAt).length;
  const allMarked = markedCount === session.attendances.length;

  const markStatus = async (attendance: Attendance, status: AttendanceStatus) => {
    if (marking[attendance.playerId]) return;
    setMarking((p) => ({ ...p, [attendance.playerId]: true }));
    try {
      await api.post("/attendance/mark", {
        sessionId: session.id,
        playerId: attendance.playerId,
        status,
      });
      onUpdate();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to mark attendance");
    } finally {
      setMarking((p) => ({ ...p, [attendance.playerId]: false }));
    }
  };

  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>, att: Attendance) => {
    const file = e.target.files?.[0];
    if (!file || !att.id) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        await api.post(`/attendance/${att.id}/photo`, {
          photoBase64: base64,
          mimeType: file.type,
        });
        onUpdate();
        setPhotoModal(null);
      } catch {
        alert("Failed to upload photo");
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="card overflow-hidden">
      {/* Session header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pitch-gradient flex items-center justify-center">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <div className="font-semibold text-slate-900">{timeLabel} Session</div>
            <div className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
              <span
                className={clsx(
                  "inline-flex items-center gap-1 text-xs font-medium",
                  allMarked ? "text-pitch-600" : "text-amber-600"
                )}
              >
                {allMarked ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                )}
                {markedCount}/{session.attendances.length} marked
              </span>
            </div>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </button>

      {/* Player rows */}
      {expanded && (
        <div className="border-t border-slate-100">
          {session.attendances.length === 0 ? (
            <div className="px-5 py-8 text-center text-slate-400 text-sm">
              No players in this session
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {session.attendances.map((att) => (
                <div key={att.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/60">
                  {/* Player avatar */}
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-semibold text-sm flex-shrink-0">
                    {att.player?.name?.[0]}
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900 text-sm truncate">
                      {att.player?.name}
                    </div>
                    {att.markedAt && (
                      <div className="text-xs text-slate-400 mt-0.5">
                        Marked {new Date(att.markedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    )}
                  </div>

                  {/* Status buttons */}
                  <div className="flex items-center gap-1.5">
                    {marking[att.playerId] ? (
                      <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                    ) : (
                      (["PRESENT_REGULAR", "PRESENT_COMPLEMENTARY", "ABSENT"] as AttendanceStatus[]).map(
                        (status) => (
                          <button
                            key={status}
                            onClick={() => markStatus(att, status)}
                            title={STATUS_LABELS[status]}
                            className={clsx(
                              "px-2.5 py-1 rounded-lg text-xs font-semibold transition-all",
                              att.status === status
                                ? STATUS_COLORS[status]
                                : STATUS_INACTIVE[status]
                            )}
                          >
                            {STATUS_LABELS[status]}
                          </button>
                        )
                      )
                    )}

                    {/* Photo button */}
                    <button
                      onClick={() => setPhotoModal(att)}
                      title="Take group photo"
                      className={clsx(
                        "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                        att.photoUrl
                          ? "bg-pitch-100 text-pitch-700"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      )}
                    >
                      {att.photoUrl ? (
                        <ImageIcon className="w-4 h-4" />
                      ) : (
                        <Camera className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Photo modal */}
      {photoModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-bold text-slate-900 mb-1">
              Session Photo — {photoModal.player?.name}
            </h3>
            <p className="text-sm text-slate-500 mb-5">
              Take or upload a photo for this attendance record
            </p>

            {photoModal.photoUrl && (
              <div className="mb-4 rounded-xl overflow-hidden">
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${photoModal.photoUrl}`}
                  alt="Attendance photo"
                  className="w-full h-40 object-cover"
                />
              </div>
            )}

            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => handlePhotoCapture(e, photoModal)}
            />

            <div className="flex flex-col gap-2">
              <button
                onClick={() => cameraRef.current?.click()}
                className="btn-primary flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                Take Photo
              </button>
              <button
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*";
                  input.onchange = (e) => handlePhotoCapture(e as any, photoModal);
                  input.click();
                }}
                className="btn-secondary flex items-center justify-center gap-2"
              >
                <ImageIcon className="w-4 h-4" />
                Upload from Gallery
              </button>
              <button
                onClick={() => setPhotoModal(null)}
                className="text-sm text-slate-500 hover:text-slate-700 py-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
