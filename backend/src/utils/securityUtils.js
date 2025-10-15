import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

export const securityUtils = {
  // Password hashing
  hashPassword: async (password) => {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  },

  // Password verification
  verifyPassword: async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
  },

  // Generate JWT token
  generateToken: (payload, secret = process.env.JWT_SECRET, expiresIn = '7d') => {
    return jwt.sign(payload, secret, { expiresIn });
  },

  // Verify JWT token
  verifyToken: (token, secret = process.env.JWT_SECRET) => {
    try {
      return jwt.verify(token, secret);
    } catch (error) {
      throw new Error('Invalid token');
    }
  },

  // Generate random encryption key for diary entries
  generateEncryptionKey: () => {
    return crypto.randomBytes(32).toString('hex');
  },

  // Encrypt sensitive data
  encryptData: (text, key) => {
    const algorithm = 'aes-256-gcm';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, key);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      iv: iv.toString('hex'),
      data: encrypted,
      authTag: authTag.toString('hex')
    };
  },

  // Decrypt sensitive data
  decryptData: (encryptedData, key) => {
    const algorithm = 'aes-256-gcm';
    const decipher = crypto.createDecipher(algorithm, key);
    
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  },

  // Sanitize user input
  sanitizeInput: (input) => {
    if (typeof input === 'string') {
      return input.trim().replace(/[<>]/g, '');
    }
    return input;
  },

  // Generate secure random string for diary access
  generateSecureRandom: (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
  }
};