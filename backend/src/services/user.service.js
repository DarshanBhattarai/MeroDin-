import prisma from "../lib/prisma.js";
import { ValidationError, NotFoundError } from "../utils/errors.js";
import { hashPassword, comparePassword } from "../utils/auth.js";
import { validateEmail, validatePassword } from "../utils/helpers.js";

const userService = {
  async createUser(userData) {
    const { email, password, name } = userData;

    // Validate input
    if (!validateEmail(email)) {
      throw new ValidationError("Invalid email format");
    }
    if (!validatePassword(password)) {
      throw new ValidationError(
        "Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number"
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ValidationError("Email already registered");
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    return prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });
  },

  async authenticateUser(email, password) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

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
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user;
  },

  async updateUser(userId, updateData) {
    // Don't allow email or password updates through this method
    const { email, password, ...allowedUpdates } = updateData;

    const user = await prisma.user.update({
      where: { id: userId },
      data: allowedUpdates,
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user;
  },
};

export default userService;
