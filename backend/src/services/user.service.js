// src/services/userService.js
import prisma from "../lib/prisma.js";
import { ValidationError, NotFoundError } from "../utils/errors.js";
import {
  hashPassword,
  comparePassword,
  hashToken,
  generateOTP,
} from "../utils/auth.js";
import { sendEmail } from "../utils/email.js";
import redisClient from "../lib/redis.js"; // <-- new Redis client import

const OTP_EXPIRE_SECONDS = Number(process.env.OTP_EXPIRES_MINUTES || 15) * 60;

const userService = {
  async createUser(userData) {
    const { email, password, name } = userData;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new ValidationError("Email already registered");

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, isEmailVerified: false }, // mark unverified
    });

    return user;
  },

  async authenticateUser(email, password) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new ValidationError("Invalid credentials");

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) throw new ValidationError("Invalid credentials");

    return user;
  },

  async getUserById(userId) {
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });
    if (!user) throw new NotFoundError("User not found");
    return user;
  },
  async getUserByEmail(email) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null; // not found
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
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });
    if (!user || !user.refreshTokenHash) return false;
    return user.refreshTokenHash === hashToken(refreshToken);
  },

  // ------------------- Redis OTP Methods -------------------

  async createAndSendOTP(userId, type = "EMAIL_VERIFY") {
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });
    if (!user) throw new NotFoundError("User not found");

    const otp = generateOTP(6);
    const otpHash = hashToken(otp);
    const expiresAt = new Date(Date.now() + OTP_EXPIRE_SECONDS * 1000);

    // Save OTP in both Redis and DB
    await redisClient.set(
      `${type}:${user.email}`,
      JSON.stringify({ userId, otp: otpHash }),
      { EX: OTP_EXPIRE_SECONDS }
    );

    await prisma.user.update({
      where: { id: userId },
      data: {
        otpHash,
        otpExpiresAt: expiresAt,
        otpType: type,
        otpAttempts: 0,
      },
    });

    // Send email
    await sendEmail({
      to: user.email,
      subject:
        type === "EMAIL_VERIFY" ? "Verify your email" : "Password reset OTP",
      text: `Your OTP is ${otp} — expires in ${process.env.OTP_EXPIRES_MINUTES || 15} minutes`,
      html: `<p>Your OTP is <strong>${otp}</strong>. It expires in ${process.env.OTP_EXPIRES_MINUTES || 15} minutes.</p>`,
    });

    return { success: true };
  },

  async verifyOTP(email, suppliedOtp, expectedType) {
    const redisKey = `${expectedType}:${email}`;
    let data = await redisClient.get(redisKey);

    let userId, storedHash;

    if (data) {
      ({ userId, otp: storedHash } = JSON.parse(data));
    } else {
      // Fallback to DB
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || user.otpType !== expectedType || !user.otpHash) {
        throw new ValidationError("OTP expired or not found");
      }
      if (user.otpExpiresAt < new Date()) {
        throw new ValidationError("OTP expired");
      }
      userId = user.id;
      storedHash = user.otpHash;
    }

    if (hashToken(suppliedOtp) !== storedHash) {
      // increment attempts
      await prisma.user.update({
        where: { id: userId },
        data: { otpAttempts: { increment: 1 } },
      });
      throw new ValidationError("Invalid OTP");
    }

    // Mark email verified if needed
    if (expectedType === "EMAIL_VERIFY") {
      await prisma.user.update({
        where: { id: userId },
        data: { isEmailVerified: true },
      });
    }

    // Clear OTP from both Redis and DB
    await redisClient.del(redisKey);
    await prisma.user.update({
      where: { id: userId },
      data: {
        otpHash: null,
        otpExpiresAt: null,
        otpType: null,
        otpAttempts: 0,
      },
    });

    return true;
  },
  async setPassword(userId, newPassword) {
    const hashed = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: Number(userId) },
      data: { password: hashed, refreshTokenHash: null },
    });
    return true;
  },
};

export default userService;
