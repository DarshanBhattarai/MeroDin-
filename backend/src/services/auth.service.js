import prisma from "../lib/prisma.js";
import redisClient from "../lib/redis.js";
import {
  hashPassword,
  comparePassword,
  hashToken,
  generateOTP,
} from "../lib/auth.js";
import { sendEmail } from "../utils/email.js";
import { ValidationError, NotFoundError } from "../utils/errors.js";

const OTP_EXPIRE_SECONDS = Number(process.env.OTP_EXPIRES_MINUTES || 15) * 60;
const PREV_REFRESH_EXPIRE = 120; // 2 minutes grace

const userService = {
  // ---------------- REGISTER ----------------
  async registerUser({ email, password, fullName }) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.isEmailVerified) {
      throw new ValidationError("Email already registered and verified.");
    }

    const hashedPassword = await hashPassword(password);
    const otp = generateOTP(6);
    const otpHash = hashToken(otp);

    await redisClient.set(
      `pendingUser:${email}`,
      JSON.stringify({ email, fullName, hashedPassword, otpHash }),
      { EX: OTP_EXPIRE_SECONDS }
    );

    await sendEmail({
      to: email,
      subject: "Verify your email",
      text: `Your OTP is ${otp}. Expires in ${process.env.OTP_EXPIRES_MINUTES || 15} minutes.`,
      html: `<p>Your OTP is <strong>${otp}</strong>. Expires in ${process.env.OTP_EXPIRES_MINUTES || 15} minutes.</p>`,
    });

    return { message: "OTP sent to email for verification." };
  },

  // ---------------- VERIFY EMAIL OTP ----------------
  async verifyEmailOTP({ email, otp }) {
    const cached = await redisClient.get(`pendingUser:${email}`);
    if (!cached)
      throw new ValidationError("OTP expired. Please register again.");

    const { fullName, hashedPassword, otpHash } = JSON.parse(cached);

    if (hashToken(otp) !== otpHash) throw new ValidationError("Invalid OTP.");

    const user = await prisma.user.upsert({
      where: { email },
      create: {
        email,
        fullName,
        password: hashedPassword,
        isEmailVerified: true,
      },
      update: { fullName, password: hashedPassword, isEmailVerified: true },
    });

    await redisClient.del(`pendingUser:${email}`);

    await prisma.otpLog.create({
      data: {
        userId: user.id,
        otpType: "EMAIL_VERIFY",
        attempts: 1,
        success: true,
      },
    });

    return { user };
  },

  // ---------------- CREATE OTP ----------------
  async createAndSendOTP(userId, type) {
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });
    if (!user) throw new NotFoundError("User not found.");

    const otp = generateOTP(6);
    const otpHash = hashToken(otp);

    await redisClient.set(
      `otp:${type}:${user.email}`,
      JSON.stringify({ otpHash, userId: user.id }),
      { EX: OTP_EXPIRE_SECONDS }
    );

    await sendEmail({
      to: user.email,
      subject:
        type === "EMAIL_VERIFY" ? "Verify your email" : "Password Reset OTP",
      text: `Your OTP is ${otp}. Expires in ${process.env.OTP_EXPIRES_MINUTES || 15} minutes.`,
      html: `<p>Your OTP is <strong>${otp}</strong>. Expires in ${process.env.OTP_EXPIRES_MINUTES || 15} minutes.</p>`,
    });

    return { message: `OTP sent to ${user.email}` };
  },

  // ---------------- VERIFY OTP ----------------
  async verifyOTP(email, otp, type) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundError("User not found.");

    const cached = await redisClient.get(`otp:${type}:${email}`);
    if (!cached)
      throw new ValidationError("OTP expired. Please request a new one.");

    const { otpHash } = JSON.parse(cached);
    const success = hashToken(otp) === otpHash;

    if (!success) throw new ValidationError("Invalid OTP.");

    if (type === "EMAIL_VERIFY" && !user.isEmailVerified) {
      await prisma.user.update({
        where: { id: user.id },
        data: { isEmailVerified: true },
      });
    }

    await prisma.otpLog.create({
      data: { userId: user.id, otpType: type, attempts: 1, success },
    });
    await redisClient.del(`otp:${type}:${email}`);

    return { user };
  },

  // ---------------- AUTHENTICATION ----------------
  async authenticateUser(email, password) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await comparePassword(password, user.password))) {
      throw new ValidationError("Invalid credentials.");
    }
    if (!user.isEmailVerified)
      throw new ValidationError("Please verify your email.");
    return user;
  },

  // ---------------- REFRESH TOKEN ----------------
  async saveRefreshToken(userId, refreshToken) {
    const refreshTokenHash = hashToken(refreshToken);
    await prisma.user.update({
      where: { id: Number(userId) },
      data: { refreshTokenHash },
    });
  },

  async verifyRefreshToken(userId, refreshToken) {
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: { refreshTokenHash: true },
    });
    if (!user?.refreshTokenHash) return false;
    return hashToken(refreshToken) === user.refreshTokenHash;
  },

  async verifyPreviousRefreshToken(userId, refreshToken) {
    const prevHash = await redisClient.get(`prevRefresh:${userId}`);
    if (!prevHash) return false;
    return hashToken(refreshToken) === prevHash;
  },

  async rotateRefreshToken(userId, oldToken, newToken) {
    if (oldToken) {
      await redisClient.set(`prevRefresh:${userId}`, hashToken(oldToken), {
        EX: PREV_REFRESH_EXPIRE,
      });
    }
    const newHash = hashToken(newToken);
    await prisma.user.update({
      where: { id: Number(userId) },
      data: { refreshTokenHash: newHash },
    });
  },

  async clearRefreshToken(userId) {
    await prisma.user.update({
      where: { id: Number(userId) },
      data: { refreshTokenHash: null },
    });
  },

  // ---------------- RESET PASSWORD ----------------
  async setPassword(userId, newPassword) {
    const hashed = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: Number(userId) },
      data: { password: hashed, refreshTokenHash: null },
    });
    return { message: "Password updated successfully." };
  },

  // ---------------- UTILITIES ----------------
  async getUserByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
  },

  async getUserById(userId) {
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });
    if (!user) throw new NotFoundError("User not found.");
    return user;
  },
};

export default userService;
