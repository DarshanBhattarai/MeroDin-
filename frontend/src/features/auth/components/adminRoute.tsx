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
        router.replace("/auth/login");
      } else if (user.role !== "ADMIN") {
        router.replace("/dashboard");
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

  if (user && user.role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Access Denied</p>
      </div>
    );
  }

  return <>{children}</>;
}