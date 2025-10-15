// src/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import { AuthenticationError } from "../utils/errors.js";

export const authenticate = async (req, res, next) => {
  try {
    const token =
      req.cookies?.access_token ||
      (req.headers.authorization && req.headers.authorization.split(" ")[1]);
    if (!token) throw new AuthenticationError("No access token");

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (e) {
      throw new AuthenticationError("Invalid or expired token");
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(payload.userId) },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isEmailVerified: true,
      },
    });
    if (!user) throw new AuthenticationError("User not found");

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

export const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return responseHandler.error(res, 'Authentication required', 401);
    }

    if (!roles.includes(req.user.role)) {
      return responseHandler.error(res, 'Insufficient permissions', 403);
    }

    next();
  };
};

export const diaryOwnership = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Import here to avoid circular dependency
    const { diaryService } = await import('../services/diaryService.js');

    const diaryEntry = await diaryService.getDiaryEntryById(parseInt(id));

    if (!diaryEntry) {
      return responseHandler.error(res, 'Diary entry not found', 404);
    }

    // Admins can access non-secret entries, users can only access their own
    if (userRole !== 'ADMIN' && diaryEntry.userId !== userId) {
      return responseHandler.error(res, 'Access denied to this diary entry', 403);
    }

    // Store diary entry for later use
    req.diaryEntry = diaryEntry;
    next();
  } catch (error) {
    return responseHandler.error(res, error.message, 500);
  }
};