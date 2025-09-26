const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface AuthData {
  email: string;
  password: string;
}

interface UserResponse {
  user: { email: string; token: string }; // Adjust based on your backend response
}

async function login(data: AuthData): Promise<UserResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Login failed");
  }

  return res.json();
}

async function register(data: AuthData): Promise<UserResponse> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Registration failed");
  }

  return res.json();
}

// OAuth login (Google / Github)
async function oauthLogin(provider: "google" | "github"): Promise<UserResponse> {
  // This assumes backend redirects or returns JSON with user & token
  const res = await fetch(`${API_URL}/auth/oauth/${provider}`, {
    method: "GET",
    credentials: "include", // For cookies if backend sets session
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || `${provider} login failed`);
  }

  return res.json();
}

export default { login, register, oauthLogin };
