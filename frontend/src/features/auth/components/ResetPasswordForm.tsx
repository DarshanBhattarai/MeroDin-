// src/features/auth/components/ResetPasswordForm.tsx - FIXED
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Input from "@/app/components/ui/Input";
import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import OTPBox from "./otpModel";
import * as authService from "@/features/auth/services/authService";

export default function ResetPasswordForm() {
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOTP, setShowOTP] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    // First, request OTP for password reset
    setLoading(true);
    try {
      await authService.requestPasswordReset({ email });
      setShowOTP(true);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (otp: string) => {
    setLoading(true);
    setError(null);

    try {
      await authService.resetPassword({
        email,
        otp,
        newPassword,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to reset password. Please check the OTP and try again.");
      setShowOTP(false); // Close OTP box on error
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="text-green-500 text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Password Reset Successful!
          </h2>
          <p className="text-gray-600 mb-6">
            Your password has been reset successfully. You can now log in with your new password.
          </p>
          <Button
            onClick={() => router.push("/auth/login")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Go to Login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center">
      <Card className="w-full max-w-md p-8">
        <h2 className="text-3xl font-bold text-black text-center mb-2">
          Reset Password
        </h2>
        <p className="text-gray-400 text-sm text-center mb-6">
          Enter your email and new password
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

          <Input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            disabled={loading}
          />

          <Input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
          />

          <Button
            type="submit"
            disabled={loading || !email || !newPassword || !confirmPassword}
            className="w-full bg-blue-600 hover:bg-blue-700 font-semibold text-white py-2.5 rounded-lg transition-all duration-300"
          >
            {loading ? "Sending OTP..." : "Send OTP & Reset Password"}
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

      {/* OTP Modal for Password Reset */}
      {showOTP && (
        <OTPBox
          email={email}
          onVerified={handleResetPassword}
          onClose={() => setShowOTP(false)}
          type="PASSWORD_RESET"
        />
      )}
    </div>
  );
}