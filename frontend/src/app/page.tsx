"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/components/AuthProvider"; // Updated import path

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // User is logged in - redirect to dashboard
        console.log("✅ User is authenticated, redirecting to dashboard");
        router.replace("/dashboard");
      } else {
        // User is not logged in - redirect to login page
        console.log("❌ User not authenticated, redirecting to login");
        router.replace("/auth/login");
      }
    }
  }, [user, loading, router]);

  // Show loading while checking authentication
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-indigo-900">Welcome to Mero Din</h2>
        <p className="text-gray-600 mt-2">Checking authentication status...</p>
      </div>
    </div>
  );
}