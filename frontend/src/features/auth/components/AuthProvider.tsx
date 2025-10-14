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
  username?: string;
  email: string;
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
  }) => Promise<void>;
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
  const [loading, setLoading] = useState(true); // loading state for initial fetch

  // Fetch current user on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await authService.getCurrentUser();
        if (res?.user) setUser(res.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false); // done fetching
      }
    })();
  }, []);

  const login = async (data: { email: string; password: string }) => {
    await authService.login(data);
    const res = await authService.getCurrentUser();
    setUser(res.user || null);
  };

  const register = async (data: {
    username?: string;
    fullName?: string;
    email: string;
    password: string;
  }) => {
    // send OTP only
    await authService.register(data);
  };

  const verifyOTP = async (email: string, otp: string) => {
    setLoading(true); // Set loading to true during verification
    try {
      const res = await authService.verifyOTP({ email, otp });
      setUser(res.user || null); // Set user from response
    } catch (error) {
      setUser(null); // Ensure user is null on error
      throw error; // Re-throw to handle in the component
    } finally {
      setLoading(false); // Always set loading to false
    }
  };

  const oauthLogin = (provider: "google" | "github") => {
    if (provider === "google") authService.googleLoginRedirect();
    else authService.githubLoginRedirect();
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
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
