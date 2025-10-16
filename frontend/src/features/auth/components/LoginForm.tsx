// src/features/auth/components/LoginForm.tsx - UPDATED
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Input from "@/app/components/ui/Input";
import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import OAuthButtons from "./OAuthButtons";
import useAuth from "../hooks/useAuth";
import Link from "next/link";

export default function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState(""); // Changed from usernameOrEmail to email
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login({ email, password, rememberMe });

      // Redirect based on role
      if (user?.role === "ADMIN") {
        router.push("/pages/admin");
      } else {
        router.push("/pages/dashboard");
      }
    } catch (err: unknown) {
      setError((err as Error)?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-[75vh] flex items-center justify-center">
      <Card className="w-full max-w-md p-8">
        <h2 className="text-3xl font-bold text-black text-center mb-2">
          Welcome Back
        </h2>
        <p className="text-gray-400 text-sm text-center mb-6">
          Log in to continue
        </p>

        {error && (
          <p className="text-red-400 bg-red-900/30 text-sm rounded-md px-3 py-2 mb-4 text-center">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email" // Changed to email type
            placeholder="Email Address" // Updated placeholder
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

          <div className="flex items-center justify-between text-sm text-gray-400">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="accent-blue-500"
              />
              Remember me
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-blue-400 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 font-semibold text-white py-2.5 rounded-lg transition-all duration-300"
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <div className="my-6 flex items-center justify-center gap-2">
          <span className="h-px flex-1 bg-gray-700" />
          <span className="text-sm text-gray-500">or continue with</span>
          <span className="h-px flex-1 bg-gray-700" />
        </div>

        <OAuthButtons />

        <p className="mt-6 text-center text-gray-400 text-sm">
          Don't have an account?{" "}
          <a
            href="/pages/auth/register"
            className="text-blue-400 hover:underline"
          >
            Sign Up
          </a>
        </p>
      </Card>
    </div>
  );
}
