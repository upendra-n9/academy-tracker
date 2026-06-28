"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { coach, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (coach) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [coach, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-pitch-gradient">
      <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
