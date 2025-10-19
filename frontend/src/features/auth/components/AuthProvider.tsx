"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import * as authService from "@/features/auth/services/authService";

// --- User type ---
export type User = {
  id: number;
  email: string;
  fullName?: string;
  role: "USER" | "ADMIN";
  isEmailVerified?: boolean;
} | null;

// --- Auth context type ---
type AuthContextType = {
  user: User;
  loading: boolean;
  setUser: (user: User) => void;
  login: (data: {
    email: string;
    password: string;
    rememberMe?: boolean;
  }) => Promise<User>;
  register: (data: {
    username?: string;
    fullName?: string;
    email: string;
    password: string;
  }) => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  oauthLogin: (provider: "google" | "github") => void;
  logout: () => Promise<void>;
};

// --- Create context ---
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

// --- AuthProvider ---
type AuthProviderProps = { children: ReactNode };

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  // Fetch current user on mount
  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      try {
        const res = await authService.getCurrentUser();
        if (isMounted) setUser(res.user);
      } catch {
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUser();

    const interval = setInterval(async () => {
      try {
        await authService.refreshTokens();
        const res = await authService.getCurrentUser();
        if (isMounted) setUser(res.user || null);
      } catch {
        if (isMounted) setUser(null);
      }
    }, 14 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const login = async (data: {
    email: string;
    password: string;
    rememberMe?: boolean;
  }) => {
    try {
      await authService.login(data);
      const currentUser = await authService.getCurrentUser();
      const user = currentUser?.user || null;
      setUser(user);
      return user;
    } catch (error: any) {
      setUser(null);
      throw new Error(error?.message || "Login failed");
    }
  };

  const register = async (data: {
    username?: string;
    fullName?: string;
    email: string;
    password: string;
  }) => {
    await authService.register(data);
  };

  const verifyOTP = async (email: string, otp: string) => {
    setLoading(true);
    try {
      const res = await authService.verifyOTP({ email, otp });
      setUser(res.user || null);
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const oauthLogin = (provider: "google" | "github") => {
    provider === "google"
      ? authService.googleLoginRedirect()
      : authService.githubLoginRedirect();
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        setUser,
        login,
        register,
        verifyOTP,
        oauthLogin,
        logout,
      }}
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
