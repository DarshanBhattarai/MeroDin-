export type UserRole = "admin" | "user";

export type User = {
  id: number;
  email: string;
  fullName: string | null; // Match your backend
  role: UserRole;
  profilePicture?: string;
  isEmailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterCredentials = {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
};

export type LoginResponse = {
  token: string;
  user: User;
  refreshToken?: string;
  expiresIn?: number;
};

export type OTP = {
  email: string;
  code: string;
  expiresAt: string;
  type?: "email_verification" | "password_reset" | "login";
};

export type ForgotPasswordData = {
  email: string;
};

export type ResetPasswordData = {
  token: string;
  password: string;
  confirmPassword?: string;
};

export type VerifyEmailData = {
  token: string;
};

export type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
};

export type AuthResponse = {
  success: boolean;
  data?: LoginResponse;
  message?: string;
  error?: string;
};
