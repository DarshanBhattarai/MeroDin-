"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import  useAuth  from "@/features/auth/hooks/useAuth";

export default function SuccessPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) throw new Error("Login failed");
        const data = await res.json();
        setUser(data.user || null);
        router.replace("/dashboard");
      } catch (err) {
        console.error(err);
        router.replace("/auth/login");
      } finally {
        setLoading(false);
      }
    })();
  }, [router, setUser]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Logging you in...</h1>
        <p>Please wait a moment...</p>
      </div>
    );

  return null;
}
