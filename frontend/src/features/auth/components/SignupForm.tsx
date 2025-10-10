"use client";

import { useState, FormEvent } from "react";
import Input from "@/app/components/ui/Input";
import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import OAuthButtons from "./OAuthButtons";
import useAuth from "../hooks/useAuth";

export default function SignupForm() {
  const { register } = useAuth();
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await register({ fullName, email, password });
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center">
      <Card className="w-full max-w-md p-8 bg-gray-900/90 border border-gray-700 rounded-2xl shadow-lg backdrop-blur-lg transition-all hover:shadow-xl">
        <h2 className="text-3xl font-bold text-black text-center mb-2">
          Create Your Account
        </h2>
        <p className="text-gray-400 text-sm text-center mb-6">
          Sign up to get started
        </p>

        {error && (
          <p className="text-red-400 bg-red-900/30 text-sm rounded-md px-3 py-2 mb-4 text-center">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <Input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 font-semibold text-white py-2.5 rounded-lg transition-all duration-300"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </Button>
        </form>

        <div className="my-6 flex items-center justify-center gap-2">
          <span className="h-px flex-1 bg-gray-700" />
          <span className="text-sm text-gray-500">or continue with</span>
          <span className="h-px flex-1 bg-gray-700" />
        </div>

        <OAuthButtons />

        <p className="mt-6 text-center text-gray-400 text-sm">
          Already have an account?{" "}
          <a href="/auth/login" className="text-blue-400 hover:underline">
            Log In
          </a>
        </p>
      </Card>
    </div>
  );
}
