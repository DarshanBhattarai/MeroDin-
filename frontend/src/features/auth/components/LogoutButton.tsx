// src/components/LogoutButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/features/auth/hooks/useAuth"; // Adjust path as needed
import Button from "@/app/components/ui/Button";

export default function LogoutButton() {
  const { logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      // Redirect to login page after successful logout
      router.push("/landing");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleLogout}
      disabled={loading}
      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
    >
      {loading ? "Logging out..." : "Logout"}
    </Button>
  );
}