"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import authService from "@/features/auth/services/authService";

// User type (extensible)
type User = {
  id?: string;
  email: string;
  token: string;
} | null;

// Auth context type
type AuthContextType = {
  user: User;
  login: (data: { email: string; password: string }) => Promise<void>;
  register: (data: { email: string; password: string }) => Promise<void>;
  oauthLogin: (provider: "google" | "github") => Promise<void>;
  logout: () => void;
};

// Create context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component
type AuthProviderProps = { children: ReactNode };

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });

  const login = async (data: { email: string; password: string }) => {
    try {
      const res = await authService.login(data);
      setUser(res.user);
      localStorage.setItem("user", JSON.stringify(res.user));
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const register = async (data: { email: string; password: string }) => {
    try {
      const res = await authService.register(data);
      setUser(res.user);
      localStorage.setItem("user", JSON.stringify(res.user));
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const oauthLogin = async (provider: "google" | "github") => {
    try {
      const res = await authService.oauthLogin(provider);
      setUser(res.user);
      localStorage.setItem("user", JSON.stringify(res.user));
    } catch (error) {
      console.error(`OAuth login failed (${provider}):`, error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, oauthLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
