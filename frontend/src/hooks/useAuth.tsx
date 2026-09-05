"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Coach } from "@/types";
import api from "@/lib/api";

interface AuthContextType {
  coach: Coach | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [coach, setCoach] = useState<Coach | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("academy_token");
    const storedCoach = localStorage.getItem("academy_coach");

    if (storedToken && storedCoach) {
      setToken(storedToken);
      setCoach(JSON.parse(storedCoach));
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const res = await api.post("/auth/login", { username, password });
    const { token: t, coach: c } = res.data;

    localStorage.setItem("academy_token", t);
    localStorage.setItem("academy_coach", JSON.stringify(c));
    setToken(t);
    setCoach(c);
  };

  const logout = () => {
    localStorage.removeItem("academy_token");
    localStorage.removeItem("academy_coach");
    setToken(null);
    setCoach(null);
  };

  return (
    <AuthContext.Provider value={{ coach, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

