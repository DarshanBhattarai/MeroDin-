// utils/securityUtils.js
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const ENCRYPTION_KEY = process.env.DIARY_ENCRYPTION_KEY || "default_32_char_key_1234567890"; // 32 chars
const IV_LENGTH = 16;

export const securityUtils = {
  // -------------------
  // Password hashing
  // -------------------
  hashPassword: async (password) => {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  },

  verifyPassword: async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
  },

  // -------------------
  // JWT Tokens
  // -------------------
  generateToken: (payload, secret = process.env.JWT_SECRET, expiresIn = "7d") => {
    return jwt.sign(payload, secret, { expiresIn });
  },

  verifyToken: (token, secret = process.env.JWT_SECRET) => {
    try {
      return jwt.verify(token, secret);
    } catch (error) {
      throw new Error("Invalid token");
    }
  },

  // -------------------
  // AES Encryption / Decryption for Diary / Sensitive Data
  // -------------------
  encryptData: (text, key = ENCRYPTION_KEY) => {
    if (!text) return null;
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv("aes-256-gcm", Buffer.from(key, "utf-8"), iv);

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();

    return {
      iv: iv.toString("hex"),
      data: encrypted,
      authTag: authTag.toString("hex"),
    };
  },

  decryptData: (encryptedData, key = ENCRYPTION_KEY) => {
    if (!encryptedData) return null;
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      Buffer.from(key, "utf-8"),
      Buffer.from(encryptedData.iv, "hex")
    );

    decipher.setAuthTag(Buffer.from(encryptedData.authTag, "hex"));

    let decrypted = decipher.update(encryptedData.data, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  },

  // -------------------
  // Quick AES helper for legacy CBC format (optional)
  // -------------------
  encryptCBC: (text, key = ENCRYPTION_KEY) => {
    if (!text) return null;
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key, "utf8"), iv);

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    return iv.toString("hex") + ":" + encrypted;
  },

  decryptCBC: (text, key = ENCRYPTION_KEY) => {
    if (!text) return null;
    const [ivHex, encryptedText] = text.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(key, "utf8"), iv);

    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  },

  // -------------------
  // Sanitization
  // -------------------
  sanitizeInput: (input) => {
    if (typeof input === "string") {
      return input.trim().replace(/[<>]/g, ""); // basic sanitization
    }
    return input;
  },

  // -------------------
  // Random Generators
  // -------------------
  generateSecureRandom: (length = 32) => {
    return crypto.randomBytes(length).toString("hex");
  },

  generateEncryptionKey: () => {
    return crypto.randomBytes(32).toString("hex");
  },
};
