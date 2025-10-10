const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// --- Types ---
export type AuthData = {
  username?: string;
  fullName?: string;
  email: string;
  password: string;
  rememberMe?: boolean;
};

export type UserResponse = {
  user: {
    username?: string;
    email: string;
    token: string;
  };
  message?: string;
};

// --- Helper for API requests ---
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    credentials: "include", // keeps cookies/sessions
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `Request failed: ${res.statusText}`);
  }

  return data;
}

// --- Auth functions ---
export async function register(data: AuthData): Promise<UserResponse> {
  return apiFetch<UserResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function login(data: {
  email: string;
  password: string;
  rememberMe?: boolean;
}): Promise<UserResponse> {
  return apiFetch<UserResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function verifyOTP(data: { email: string; otp: string }) {
  return apiFetch("/api/auth/verify-email-otp", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function resendOTP(data: { email: string; type: string }) {
  return apiFetch("/api/auth/resend-otp", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function oauthLogin(provider: "google" | "github") {
  return apiFetch<UserResponse>(`/auth/oauth/${provider}`, {
    method: "GET",
  });
}
