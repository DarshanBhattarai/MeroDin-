// src/utils/auth.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const SALT_ROUNDS = 12;

export const hashPassword = async (plain) => {
  return bcrypt.hash(plain, SALT_ROUNDS);
};

export const comparePassword = async (plain, hash) => {
  return bcrypt.compare(plain, hash);
};

export const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
  });
};

export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "30d",
  });
};

// Hash an arbitrary token (refresh/otp) before storing in DB
export const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

// Create a numeric OTP (6 digits) — you can change to alphanumeric if desired
export const generateOTP = (length = 6) => {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};
