const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// --- Types ---
export type AuthData = {
  username?: string;
  fullName?: string;
  email: string;
  password: string;
};

export type UserResponse = {
  user: {
    id: number;
    email: string;
    fullName?: string;
    role: "USER" | "ADMIN";
    isEmailVerified?: boolean;
  } | null;
  message?: string;
};
export type OTPRequest = {
  email: string;
  otp?: string;
  type?: string;
};

// --- Helper for API requests ---
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    credentials: "include", // sends HttpOnly cookies automatically
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok)
    throw new Error(data.message || `Request failed: ${res.statusText}`);

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
}): Promise<UserResponse> {
  return apiFetch<UserResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}


// --- OTP functions ---
export async function verifyOTP(data: {
  email: string;
  otp: string;
}): Promise<{ user: UserResponse['user']; message: string }> {
  console.log("🔄 Verifying OTP with data:", data);
  const response = await apiFetch<{ user: UserResponse['user']; message: string }>(
    "/api/auth/verify-email-otp",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
  console.log("✅ OTP Verification Response:", response);
  return response;
}
export async function resendOTP(data: {
  email: string;
  type: string;
}): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/api/auth/resend-otp", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
// Password reset functions
export async function requestPasswordReset(data: {
  email: string;
}): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/api/auth/request-password-reset", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function resetPassword(data: {
  email: string;
  otp: string;
  newPassword: string;
}): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// --- Fetch current user ---
export async function getCurrentUser(): Promise<UserResponse> {
  return apiFetch<UserResponse>("/api/auth/me", { method: "GET" });
}

// --- Logout ---
export async function logout(): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/api/auth/logout", { method: "POST" });
}

// --- OAuth login ---
export function oauthLogin(provider: "google" | "github") {
  window.location.href = `${API_URL}/api/auth/${provider}`;
}

export function googleLoginRedirect() {
  window.location.href = `${API_URL}/api/auth/google`;
}

export function githubLoginRedirect() {
  window.location.href = `${API_URL}/api/auth/github`;
}

//-- Admin functions --//
export async function adminLogin(data: {
  email: string;
  password: string;
}): Promise<UserResponse> {
  return apiFetch<UserResponse>("/api/admin/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
