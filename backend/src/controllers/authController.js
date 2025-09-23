import { AuthenticationError } from "../utils/errors.js";
import { generateToken } from "../utils/auth.js";
import prisma from "../lib/prisma.js";
import { hashPassword, comparePassword } from "../utils/auth.js";

export const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AuthenticationError("Email already registered");
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    // Generate token
    const token = generateToken({ userId: user.id });

    res.status(201).json({
      message: "User registered successfully",
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AuthenticationError("Invalid credentials");
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new AuthenticationError("Invalid credentials");
    }

    // Generate token
    const token = generateToken({ userId: user.id });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: "Login successful",
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    // req.user is set by authenticate middleware
    const { password: _, ...userWithoutPassword } = req.user;
    res.json({
      message: "Profile retrieved successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};
