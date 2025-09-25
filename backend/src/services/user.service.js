// src/services/userService.js
import prisma from "../lib/prisma.js";
import { ValidationError, NotFoundError } from "../utils/errors.js";
import { hashPassword, comparePassword, hashToken, generateOTP } from "../utils/auth.js";
import { sendEmail } from "../utils/email.js";
import crypto from "crypto";

const userService = {
  async createUser(userData) {
    const { email, password, name } = userData;
    // (You can keep your existing validation)
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ValidationError("Email already registered");
    }
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name },
    });

    return user;
  },

  async authenticateUser(email, password) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new ValidationError("Invalid credentials");
    }
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new ValidationError("Invalid credentials");
    }
    return user;
  },

  async getUserById(userId) {
    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!user) throw new NotFoundError("User not found");
    return user;
  },

  async saveRefreshToken(userId, refreshToken) {
    const hashed = hashToken(refreshToken);
    await prisma.user.update({
      where: { id: Number(userId) },
      data: { refreshTokenHash: hashed },
    });
  },

  async clearRefreshToken(userId) {
    await prisma.user.update({
      where: { id: Number(userId) },
      data: { refreshTokenHash: null },
    });
  },

  async verifyRefreshToken(userId, refreshToken) {
    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!user || !user.refreshTokenHash) return false;
    return user.refreshTokenHash === hashToken(refreshToken);
  },

  // OTP helpers
  async createAndSendOTP(userId, type = "EMAIL_VERIFY") {
    const otp = generateOTP(6);
    const otpHash = hashToken(otp);
    const expiresAt = new Date(Date.now() + (Number(process.env.OTP_EXPIRES_MINUTES || 15) * 60 * 1000));
    await prisma.user.update({
      where: { id: Number(userId) },
      data: {
        otpHash,
        otpExpiresAt: expiresAt,
        otpType: type,
        otpAttempts: 0,
      },
    });

    // Fetch user email
    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    // send email
    await sendEmail({
      to: user.email,
      subject: type === "EMAIL_VERIFY" ? "Verify your email" : "Password reset OTP",
      text: `Your OTP is ${otp} — expires in ${process.env.OTP_EXPIRES_MINUTES || 15} minutes`,
      html: `<p>Your OTP is <strong>${otp}</strong>. It expires in ${process.env.OTP_EXPIRES_MINUTES || 15} minutes.</p>`,
    });

    // Return true (never return OTP to client in production). For dev you can optionally return the OTP.
    return { success: true };
  },

  async verifyOTP(userId, suppliedOtp, expectedType) {
    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!user || !user.otpHash || !user.otpExpiresAt) {
      throw new ValidationError("No OTP found or expired");
    }
    if (user.otpType !== expectedType) {
      throw new ValidationError("OTP type mismatch");
    }
    if (new Date() > user.otpExpiresAt) {
      throw new ValidationError("OTP expired");
    }
    // check attempts
    if (user.otpAttempts >= 5) {
      throw new ValidationError("Too many OTP attempts");
    }

    const suppliedHash = hashToken(suppliedOtp);
    if (suppliedHash !== user.otpHash) {
      await prisma.user.update({ where: { id: Number(userId) }, data: { otpAttempts: { increment: 1 } } });
      throw new ValidationError("Invalid OTP");
    }

    // success: clear OTP and set email verified if email verify
    const updates = { otpHash: null, otpExpiresAt: null, otpType: null, otpAttempts: 0 };
    if (expectedType === "EMAIL_VERIFY") {
      updates.isEmailVerified = true;
    }

    await prisma.user.update({ where: { id: Number(userId) }, data: updates });
    return true;
  },

  async setPassword(userId, newPassword) {
    const hashed = await hashPassword(newPassword);
    await prisma.user.update({ where: { id: Number(userId) }, data: { password: hashed, refreshTokenHash: null } });
    // Clearing refresh tokens forces re-login everywhere
    return true;
  },
};

export default userService;
