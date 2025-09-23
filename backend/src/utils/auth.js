import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthenticationError } from "./errors.js";

const SALT_ROUNDS = 10;

export const hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateToken = (payload) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
};

export const verifyToken = (token) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new AuthenticationError("Invalid token");
  }
};
