"use client";

import { useState, useRef, useEffect } from "react";
import Button from "@/app/components/ui/Button";
import * as authService from "../services/authService";

type OTPBoxProps = {
  length?: number;
  email: string;
  onVerified: () => void;
  onClose?: () => void;
};

export default function OTPBox({
  length = 6,
  email,
  onVerified,
  onClose,
}: OTPBoxProps) {
  const [otp, setOTP] = useState(Array(length).fill(""));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number
  ) => {
    const val = e.target.value;
    if (/^\d*$/.test(val)) {
      const newOTP = [...otp];
      newOTP[idx] = val;
      setOTP(newOTP);
      if (val && idx < length - 1) inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number
  ) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      const newOTP = [...otp];
      newOTP[idx - 1] = "";
      setOTP(newOTP);
      inputsRef.current[idx - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage(null);
    try {
      // Use your authService to verify OTP
      await authService.verifyOTP({ email, otp: otp.join("") }); // You can add verifyOTP to authService
      setMessage("✅ OTP verified successfully!");
      onVerified();
    } catch (err: any) {
      setMessage(err.message || "❌ Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setMessage(null);
    try {
      // Use your authService to resend OTP
      await authService.resendOTP({ email, type: "EMAIL_VERIFY" }); // Add resendOTP in authService
      setMessage("✅ OTP resent successfully!");
      setOTP(Array(length).fill(""));
      inputsRef.current[0]?.focus();
    } catch (err: any) {
      setMessage(err.message || "❌ Resend failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-xl max-w-sm w-full shadow-lg text-center relative">
        {onClose && (
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl font-bold"
            onClick={onClose}
          >
            ×
          </button>
        )}

        <h3 className="text-xl font-bold text-white mb-4">Enter OTP</h3>
        <p className="text-gray-400 text-sm mb-4">
          OTP has been sent to <strong>{email}</strong>
        </p>

        <div className="flex justify-center gap-2 mb-4">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputsRef.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className="w-12 h-12 text-center text-lg font-bold rounded-lg border border-gray-600 bg-gray-800 text-white focus:ring-2 focus:ring-blue-500"
            />
          ))}
        </div>

        {message && (
          <p
            className={`mb-2 text-sm ${
              message.includes("✅") ? "text-green-400" : "text-red-400"
            }`}
          >
            {message}
          </p>
        )}

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg mb-2"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </Button>

        <Button
          onClick={handleResend}
          disabled={loading}
          className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg"
        >
          {loading ? "Resending..." : "Resend OTP"}
        </Button>
      </div>
    </div>
  );
}
