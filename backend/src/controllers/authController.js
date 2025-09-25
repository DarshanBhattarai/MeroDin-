// src/controllers/auth.controller.js
import prisma from "../lib/prisma.js";
import userService from "../services/user.service.js";
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} from "../utils/auth.js";
import { AuthenticationError, ValidationError } from "../utils/errors.js";
import jwt from "jsonwebtoken";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === "true",
  sameSite: "lax",
  // maxAge will be set per cookie
  // domain/path set by server if needed
};

export const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    const created = await userService.createUser({ email, password, name });

    // Create OTP and send email verification via Redis
    await userService.createAndSendOTP(created.id, "EMAIL_VERIFY");

    res.status(201).json({
      message: "User created. Verification OTP sent to email.",
      user: { id: created.id, email: created.email, name: created.name },
    });
  } catch (err) {
    next(err);
  }
};

export const verifyEmailOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body; // now we use email instead of userId
    await userService.verifyOTP(email, otp, "EMAIL_VERIFY");
    res.json({ message: "Email verified successfully" });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await userService.authenticateUser(email, password);

    if (!user.isEmailVerified) {
      throw new AuthenticationError(
        "Email not verified. Please verify your email first."
      );
    }

    const accessToken = generateAccessToken({ userId: user.id });
    const refreshToken = generateRefreshToken({ userId: user.id });

    // store hashed refresh token in DB
    await userService.saveRefreshToken(user.id, refreshToken);

    // set cookies
    res.cookie("access_token", accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 1000 * 60 * 15,
    });
    res.cookie("refresh_token", refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    const { password: _, ...userWithoutPassword } = user;
    res.json({ message: "Login successful", user: userWithoutPassword });
  } catch (err) {
    next(err);
  }
};

export const refreshTokens = async (req, res, next) => {
  try {
    const token = req.cookies?.refresh_token;
    if (!token) throw new AuthenticationError("No refresh token");

    // verify signature
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      throw new AuthenticationError("Invalid refresh token");
    }

    const valid = await userService.verifyRefreshToken(payload.userId, token);
    if (!valid) {
      // possible theft -> clear any stored token
      await userService.clearRefreshToken(payload.userId).catch(() => {});
      throw new AuthenticationError("Refresh token invalid or revoked");
    }

    // Rotate tokens: issue new refresh + access
    const newAccess = generateAccessToken({ userId: payload.userId });
    const newRefresh = generateRefreshToken({ userId: payload.userId });
    await userService.saveRefreshToken(payload.userId, newRefresh);

    res.cookie("access_token", newAccess, {
      ...COOKIE_OPTIONS,
      maxAge: 1000 * 60 * 15,
    });
    res.cookie("refresh_token", newRefresh, {
      ...COOKIE_OPTIONS,
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    res.json({ message: "Tokens refreshed" });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refresh_token;
    // if available, clear it in DB (by userId)
    if (token) {
      try {
        const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        await userService.clearRefreshToken(payload.userId);
      } catch (e) {
        // ignore
      }
    }

    // Clear cookies
    res.clearCookie("access_token", COOKIE_OPTIONS);
    res.clearCookie("refresh_token", COOKIE_OPTIONS);

    res.json({ message: "Logged out" });
  } catch (err) {
    next(err);
  }
};

// Password reset requests
export const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await userService.getUserByEmail(email); // fetch by email

    if (user) {
      await userService.createAndSendOTP(user.id, "PASSWORD_RESET"); // use user.id
    }

    res.json({ message: "If account exists, OTP sent to email" });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    await userService.verifyOTP(email, otp, "PASSWORD_RESET");

    const user = await userService.getUserByEmail(email);
    if (!user) throw new ValidationError("User not found");

    await userService.setPassword(user.id, newPassword); // ✅ pass user.id
    res.json({ message: "Password reset successful" });
  } catch (err) {
    next(err);
  }
};

// Resend OTP
export const resendOTP = async (req, res, next) => {
  try {
    const { email, type } = req.body; // type = "EMAIL_VERIFY" | "PASSWORD_RESET"
    if (!email || !type) {
      return res.status(400).json({ message: "Email and type are required" });
    }

    const user = await userService.getUserByEmail(email);
    if (!user) return res.status(404).json({ message: "User not found" });

    await userService.createAndSendOTP(user.id, type);
    res.json({ message: "OTP resent successfully" });
  } catch (err) {
    next(err);
  }
};

