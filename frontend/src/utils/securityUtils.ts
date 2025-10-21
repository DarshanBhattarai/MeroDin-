// src/utils/securityUtils.ts
import crypto from "crypto";

// ⚠️ IMPORTANT: This key must match the backend encryption key or be derived safely via API
const ENCRYPTION_KEY =
  process.env.NEXT_PUBLIC_DIARY_ENCRYPTION_KEY || "default_32_char_key_1234567890"; // 32 chars
const IV_LENGTH = 16;

export const securityUtils = {
  // Sanitize user input (optional, basic)
  sanitizeInput(input: string): string {
    return input?.replace(/[<>]/g, "") || "";
  },

  // Encrypt text (optional for frontend usage, usually handled in backend)
  encrypt(text: string): string | null {
    if (!text) return null;
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(
      "aes-256-cbc",
      Buffer.from(ENCRYPTION_KEY),
      iv
    );
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return iv.toString("hex") + ":" + encrypted;
  },

  // Decrypt text (used for all diary entries)
  decrypt(text: string | null | undefined): string {
    if (!text) return "";
    try {
      const [ivHex, encryptedText] = text.split(":");
      const iv = Buffer.from(ivHex, "hex");
      const decipher = crypto.createDecipheriv(
        "aes-256-cbc",
        Buffer.from(ENCRYPTION_KEY),
        iv
      );
      let decrypted = decipher.update(encryptedText, "hex", "utf8");
      decrypted += decipher.final("utf8");
      return decrypted;
    } catch (error) {
      console.error("Decryption error:", error);
      return "";
    }
  },

  // Generate secure random string (optional helper for frontend)
  generateSecureRandom(length = 32): string {
    return crypto.randomBytes(length).toString("hex");
  },
};
