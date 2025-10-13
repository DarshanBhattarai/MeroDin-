// src/features/auth/components/ForgotPasswordForm.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Input from "@/app/components/ui/Input";
import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import * as authService from "@/features/auth/services/authService";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await authService.requestPasswordReset({ email });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to send reset OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="text-green-500 text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Check Your Email
          </h2>
          <p className="text-gray-600 mb-6">
            We've sent a password reset OTP to <strong>{email}</strong>. 
            Please check your inbox and follow the instructions.
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => router.push("/auth/reset-password")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Enter Reset OTP
            </Button>
            <Button
              onClick={() => router.push("/auth/login")}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800"
            >
              Back to Login
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center">
      <Card className="w-full max-w-md p-8">
        <h2 className="text-3xl font-bold text-black text-center mb-2">
          Reset Your Password
        </h2>
        <p className="text-gray-400 text-sm text-center mb-6">
          Enter your email to receive a password reset OTP
        </p>

        {error && (
          <p className="text-red-400 bg-red-900/30 text-sm rounded-md px-3 py-2 mb-4 text-center">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 font-semibold text-white py-2.5 rounded-lg transition-all duration-300"
          >
            {loading ? "Sending OTP..." : "Send Reset OTP"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push("/auth/login")}
            className="text-blue-400 hover:underline text-sm"
          >
            Back to Login
          </button>
        </div>
      </Card>
    </div>
  );
}