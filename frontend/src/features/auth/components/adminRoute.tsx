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
    if (!loading && user?.role !== 'ADMIN') {
      router.replace("/pages/dashboard"); // Redirect non-admins to regular dashboard
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Checking permissions...</p>
      </div>
    );
  }

  if (user?.role !== 'ADMIN') {
    return null; // or a "Access Denied" message
  }

  return <>{children}</>;
}