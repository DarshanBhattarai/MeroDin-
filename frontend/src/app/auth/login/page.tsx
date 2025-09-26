"use client";

import AuthForm from "@/features/auth/components/AuthForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <AuthForm type="login" />
    </div>
  );
}
