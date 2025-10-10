import prisma from "../lib/prisma.js";
import redisClient from "../lib/redis.js";
import { hashPassword, comparePassword, hashToken, generateOTP } from "../utils/auth.js";
import { sendEmail } from "../utils/email.js";
import { ValidationError, NotFoundError } from "../utils/errors.js";

const OTP_EXPIRE_SECONDS = Number(process.env.OTP_EXPIRES_MINUTES || 15) * 60;
const PENDING_USER_EXPIRE = 600; // 10 min for pending registration

const userService = {
  // ---------------- REGISTER ----------------
  async registerUser({ email, password, fullName }) {
    // check DB
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser && existingUser.isEmailVerified) {
      throw new ValidationError("Email already registered and verified");
    }

    // check Redis
    const pending = await redisClient.get(`pendingUser:${email}`);
    if (pending) {
      throw new ValidationError("An OTP is already sent. Please verify your email.");
    }

    const hashedPassword = await hashPassword(password);
    const otp = generateOTP(6);
    const otpHash = hashToken(otp);

    // store in Redis
    await redisClient.set(
      `pendingUser:${email}`,
      JSON.stringify({ email, fullName, hashedPassword, otp: otpHash }),
      { EX: PENDING_USER_EXPIRE }
    );

    // send OTP
    await sendEmail({
      to: email,
      subject: "Verify your email",
      text: `Your OTP is ${otp}. It expires in 10 minutes.`,
      html: `<p>Your OTP is <strong>${otp}</strong>. It expires in 10 minutes.</p>`,
    });

    return true;
  },

  // ---------------- VERIFY EMAIL OTP ----------------
  async verifyEmailOTP({ email, otp }) {
    const data = await redisClient.get(`pendingUser:${email}`);
    if (!data) throw new ValidationError("OTP expired or not found. Please register again.");

    const { fullName, hashedPassword, otp: storedHash } = JSON.parse(data);

    if (hashToken(otp) !== storedHash) throw new ValidationError("Invalid OTP");

    // create user in DB
    const user = await prisma.user.create({
      data: { email, fullName, password: hashedPassword, isEmailVerified: true },
    });

    await redisClient.del(`pendingUser:${email}`);
    return user;
  },

  // ---------------- LOGIN ----------------
  async authenticateUser(email, password) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new ValidationError("Invalid credentials");

    const isValid = await comparePassword(password, user.password);
    if (!isValid) throw new ValidationError("Invalid credentials");

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

  // ---------------- RESEND OTP ----------------
  async resendOTP({ email, type }) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundError("User not found");

    const otp = generateOTP(6);
    const otpHash = hashToken(otp);

    await redisClient.set(`${type}:${email}`, JSON.stringify({ userId: user.id, otp: otpHash }), { EX: OTP_EXPIRE_SECONDS });

    await sendEmail({
      to: email,
      subject: type === "EMAIL_VERIFY" ? "Verify your email" : "Password reset OTP",
      text: `Your OTP is ${otp}. It expires in ${process.env.OTP_EXPIRES_MINUTES || 15} minutes.`,
      html: `<p>Your OTP is <strong>${otp}</strong>. It expires in ${process.env.OTP_EXPIRES_MINUTES || 15} minutes.</p>`,
    });

    return true;
  },

  // ---------------- PASSWORD RESET ----------------
  async setPassword(userId, newPassword) {
    const hashed = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: Number(userId) },
      data: { password: hashed, refreshTokenHash: null },
    });
    return true;
  },

  async getUserByEmail(email) {
    return await prisma.user.findUnique({ where: { email } });
  },

  async getUserById(userId) {
    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!user) throw new NotFoundError("User not found");
    return user;
  },
};

export default userService;
