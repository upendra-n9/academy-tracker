"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Trophy, Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(username, password);
      router.push("/dashboard");
    } catch {
      setError("Invalid username or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — pitch */}
      <div className="hidden lg:flex lg:w-1/2 pitch-header pitch-lines flex-col items-center justify-center p-12 text-white relative overflow-hidden">
        <div className="relative z-10 text-center max-w-md">
          {/* Field circle */}
          <div className="w-40 h-40 rounded-full border-4 border-white/20 flex items-center justify-center mx-auto mb-8">
            <div className="w-28 h-28 rounded-full border-4 border-white/30 flex items-center justify-center">
              <Trophy className="w-14 h-14 text-pitch-300" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">Academy Tracker</h1>
          <p className="text-pitch-200 text-lg leading-relaxed">
            Track attendance, manage sessions, and help your players reach their potential.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            {[
              { label: "Players", value: "10" },
              { label: "Age Groups", value: "2" },
              { label: "Sessions/Day", value: "2" },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 rounded-2xl p-4">
                <div className="text-2xl font-bold text-white">{s.value}</div>
                <div className="text-pitch-300 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative field markings */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-32 border-t-2 border-l-2 border-r-2 border-white/10 rounded-t-full" />
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-grass flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">Academy Tracker</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900">Coach sign in</h2>
            <p className="text-slate-500 mt-1.5">Use your academy credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. coach_junior"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pitch-400 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pitch-400 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-8 p-4 bg-pitch-50 rounded-xl border border-pitch-100">
            <p className="text-xs font-semibold text-pitch-700 mb-2">Demo accounts</p>
            <div className="space-y-1">
              <p className="text-xs text-slate-600">
                <span className="font-mono bg-white px-1.5 py-0.5 rounded text-slate-800">coach_junior</span>{" "}
                / <span className="font-mono bg-white px-1.5 py-0.5 rounded text-slate-800">coach123</span>{" "}
                — U12 group
              </p>
              <p className="text-xs text-slate-600">
                <span className="font-mono bg-white px-1.5 py-0.5 rounded text-slate-800">coach_senior</span>{" "}
                / <span className="font-mono bg-white px-1.5 py-0.5 rounded text-slate-800">coach123</span>{" "}
                — U16 group
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
