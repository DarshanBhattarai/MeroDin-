// src/features/auth/components/AdminRoute.tsx
"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuth from "../hooks/useAuth";

type AdminRouteProps = { children: ReactNode };

export default function AdminRoute({ children }: AdminRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // No user logged in - redirect to login
        router.replace("/pages/auth/login");
      } else if (user.role !== "ADMIN") {
        // User is not admin - redirect to regular dashboard
        router.replace("/pages/dashboard");
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Checking permissions...</p>
      </div>
    );
  }

  if (user?.role !== "ADMIN") {
    return null; // or a "Access Denied" message
  }

  return <>{children}</>;
}
