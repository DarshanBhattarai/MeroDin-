"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import GoogleLoginButton from "@/app/components/components/button/GoogleLogin";
import GithubLoginButton from "@/app/components/components/button/GithubLogin";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      router.push("/dashboard");
    } catch (err) {
      setError("Something went wrong");
      console.error(err);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md mx-auto mt-12">
      <h1 className="text-3xl font-bold text-center mb-2">Welcome Back!</h1>
      <p className="text-center text-gray-500 mb-6">Login to your account</p>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />

        <div className="text-right">
          <a
            href="/auth/forgot-password"
            className="text-sm text-blue-500 hover:underline"
          >
            Forgot Password?
          </a>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-3 rounded font-semibold hover:bg-blue-600 transition"
        >
          Login
        </button>
      </form>

      <div className="flex items-center my-4">
        <hr className="flex-grow border-gray-300" />
        <span className="mx-2 text-gray-400">or</span>
        <hr className="flex-grow border-gray-300" />
      </div>

      <div className="space-y-3">
        {/* Replaced inline buttons with imported components */}
        <GoogleLoginButton />
        <GithubLoginButton />
      </div>

      <p className="text-center text-gray-500 mt-6">
        Don’t have an account?{" "}
        <a href="/auth/register" className="text-blue-500 hover:underline">
          Sign Up
        </a>
      </p>
    </div>
  );
}
