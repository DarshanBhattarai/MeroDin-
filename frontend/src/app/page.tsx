// src/app/page.tsx - Clean redirect-only page
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import  useAuth  from "@/features/auth/hooks/useAuth"; // Fixed import path

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Check user role and redirect accordingly
        if (user.role === 'ADMIN') {
          router.replace("/admin"); // Admin goes to admin dashboard
        } else {
          router.replace("/pages/dashboard"); // Normal user goes to user dashboard
        }
      } else {
        // User is not logged in - redirect to landing page
        router.replace("/pages/landing");
      }
    }
  }, [user, loading, router]);

  // Show loading while checking authentication
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-indigo-900">
          Welcome to Mero Din
        </h2>
        <p className="text-gray-600 mt-2">Getting things ready for you...</p>
      </div>
    </div>
  );
}