"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import useAuth from "../../../features/auth/hooks/useAuth";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setUser } = useAuth(); // update context directly

  useEffect(() => {
    const token = searchParams.get("token");
    const email = searchParams.get("email");
    const name = searchParams.get("name");

    if (token && email) {
      // Update AuthProvider context
        setUser({ token, email, username: name || undefined }); 
      // Optional: also persist to localStorage
      localStorage.setItem(
        "user",
        JSON.stringify({ token, email, username: name })
      );

      // Redirect to dashboard or home
      router.replace("/");
    }
  }, [searchParams, setUser, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Logging you in...</h1>
      <p>Please wait a moment...</p>
    </div>
  );
}
