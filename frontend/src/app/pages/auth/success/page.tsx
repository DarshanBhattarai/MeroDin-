// src/app/auth/success/page.tsx - FINAL VERSION
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/components/AuthProvider";

export default function SuccessPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("🔄 Checking authentication status after OAuth...");

        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        console.log("🔍 API URL:", API_URL);

        const res = await fetch(`${API_URL}/api/auth/me`, {
          method: "GET",
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();

          if (data.user) {
            setUser(data.user);
            setTimeout(() => {
              router.replace("/dashboard");
            }, 1000);
          } else {
            throw new Error("No user data in response");
          }
        } else {
          throw new Error(`Failed to fetch user: ${res.status}`);
        }
      } catch (err: any) {
        console.error("❌ OAuth success page error:", err);
        setError(err.message || "Authentication failed");

        // Fallback: Try to redirect to dashboard anyway
        setTimeout(() => {
          console.log("🔄 Fallback: Redirecting to dashboard");
          router.replace("/dashboard");
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, setUser]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <h1 className="text-2xl font-bold mb-2">Completing Login...</h1>
        <p className="text-gray-600">
          Please wait while we set up your account.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 text-6xl mb-4">❌</div>
        <h1 className="text-2xl font-bold mb-2">Login Issue</h1>
        <p className="text-gray-600 mb-4">{error}</p>
        <p className="text-sm text-gray-500 mb-4">
          Redirecting you to dashboard...
        </p>
        <button
          onClick={() => router.replace("/dashboard")}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Go to Dashboard Now
        </button>
      </div>
    );
  }

  return null;
}
