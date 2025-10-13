"use client";

import { useState, useRef, useEffect } from "react";
import Button from "@/app/components/ui/Button";
import * as authService from "../services/authService";
import User from "../hooks/useAuth"; // just for reference

type OTPBoxProps = {
  length?: number;
  email: string;
  onVerified: (otp: string, user?: any) => void; // ✅ Add optional user parameter
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

  // Freeze email internally
  const [otpEmail] = useState(email);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number
  ) => {
    const val = e.target.value;
    if (!/^\d*$/.test(val)) return;

    const newOTP = [...otp];
    newOTP[idx] = val.slice(-1);
    setOTP(newOTP);

    if (val && idx < length - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number
  ) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newOTP = [...otp];
      if (otp[idx]) {
        newOTP[idx] = "";
        setOTP(newOTP);
      } else if (idx > 0) {
        newOTP[idx - 1] = "";
        setOTP(newOTP);
        inputsRef.current[idx - 1]?.focus();
      }
    }
  };

  const handleSubmit = async () => {
  const otpString = otp.join("");
  if (otpString.length !== length) {
    setMessage(`Please enter all ${length} digits`);
    return;
  }

  setLoading(true);
  setMessage(null);
  try {
    console.log("🔄 Sending OTP verification request...");
    const response = await authService.verifyOTP({ email: otpEmail, otp: otpString });
    console.log("✅ OTP verification successful:", response);
    
    setMessage("✅ OTP verified successfully! Redirecting...");
    
    // ✅ CRITICAL FIX: Pass the USER OBJECT, not just OTP string
    // This tells SignupForm that verification is complete
    setTimeout(() => {
      onVerified(otpString, response.user); // Pass user object
    }, 1000);
    
  } catch (err: any) {
    console.error("❌ OTP verification failed:", err);
    setMessage(err.message || "❌ Verification failed");
    setOTP(Array(length).fill(""));
    setTimeout(() => inputsRef.current[0]?.focus(), 100);
  } finally {
    setLoading(false);
  }
};

  const handleResend = async () => {
    setLoading(true);
    setMessage(null);
    try {
      await authService.resendOTP({ email: otpEmail, type: "EMAIL_VERIFY" });
      setMessage("✅ OTP resent successfully!");
      setOTP(Array(length).fill(""));
      setTimeout(() => inputsRef.current[0]?.focus(), 50);
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
          OTP has been sent to <strong>{otpEmail}</strong>
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
              disabled={loading}
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
