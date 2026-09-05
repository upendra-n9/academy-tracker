"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { NavBar } from "@/components/coach/NavBar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { coach, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !coach) {
      router.push("/login");
    }
  }, [coach, loading, router]);

  if (loading || !coach) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-grass border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">{children}</main>
    </div>
  );
}

