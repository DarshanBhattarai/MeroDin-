"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import * as authService from "@/features/auth/services/authService";
import { storage } from "@/utils/storage";

// --- User type ---
export type User = {
  username?: string;
  email: string;
  token: string;
} | null;

// --- Auth context type ---
type AuthContextType = {
  user: User;
  setUser: (user: User) => void;
  login: (data: {
    email: string;
    password: string;
    rememberMe?: boolean;
  }) => Promise<void>;
  register: (data: {
    username?: string;
    fullName?: string;
    email: string;
    password: string;
  }) => Promise<void>;
  oauthLogin: (provider: "google" | "github") => Promise<void>;
  logout: () => void;
};

// --- Create context ---
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

// --- AuthProvider ---
type AuthProviderProps = { children: ReactNode };

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>(() => storage.get<User>("user"));

  const login = async (data: {
    email: string;
    password: string;
    rememberMe?: boolean;
  }) => {
    try {
      const res = await authService.login(data);
      setUser(res.user);
      storage.set("user", res.user, data.rememberMe ? "local" : "session");
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const register = async (data: {
    username?: string;
    fullName?: string;
    email: string;
    password: string;
  }) => {
    try {
      const res = await authService.register(data);
      setUser(res.user);
      storage.set("user", res.user, "local"); // always localStorage for register
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const oauthLogin = async (provider: "google" | "github") => {
    // Redirect browser to backend OAuth route
    window.location.href = `http://localhost:5000/api/auth/${provider}`;
  };

  const logout = () => {
    setUser(null);
    storage.remove("user", "local");
    storage.remove("user", "session");
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, login, register, oauthLogin, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// --- Custom hook ---
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
