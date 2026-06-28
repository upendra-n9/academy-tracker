"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Trophy, ClipboardList, Users, LogOut, ChevronDown } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

const NAV = [
  { href: "/dashboard", label: "Sessions", icon: ClipboardList },
  { href: "/dashboard/players", label: "Players", icon: Users },
];

export function NavBar() {
  const { coach, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="pitch-header shadow-lg">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-pitch-300" />
            </div>
            <div className="hidden sm:block">
              <div className="text-white font-bold text-sm leading-none">Academy Tracker</div>
              <div className="text-pitch-300 text-xs mt-0.5">{coach?.ageGroup} Group</div>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-1">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={clsx(
                    "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-white/15 text-white"
                      : "text-pitch-200 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Coach menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-pitch-200 hover:bg-white/10 hover:text-white transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-pitch-400 flex items-center justify-center text-turf font-bold text-xs">
                {coach?.name?.[0]}
              </div>
              <span className="hidden sm:inline text-white font-medium">{coach?.name?.split(" ")[0]}</span>
              <ChevronDown className="w-4 h-4 text-pitch-300" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-100 z-20 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <div className="font-semibold text-slate-900 text-sm">{coach?.name}</div>
                    <div className="text-slate-500 text-xs mt-0.5">{coach?.ageGroup} Coach</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
