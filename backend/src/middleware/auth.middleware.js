// src/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import { AuthenticationError } from "../utils/errors.js";
import { diaryService } from "../services/diary.service.js";

const responseHandler = {
  error: (res, message, status = 500) => res.status(status).json({ error: message }),
  success: (res, data) => res.json(data),
};

// Authenticate user via JWT token
export const authenticate = async (req, res, next) => {
  try {
    const token =
      req.cookies?.access_token ||
      (req.headers.authorization && req.headers.authorization.split(" ")[1]);
    if (!token) throw new AuthenticationError("No access token");

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch {
      throw new AuthenticationError("Invalid or expired token");
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(payload.userId) },
      select: { id: true, email: true, fullName: true, role: true, isEmailVerified: true },
    });

    if (!user) throw new AuthenticationError("User not found");

    req.user = user;
    next();
  } catch (err) {
    return responseHandler.error(res, err.message, 401);
  }
};

// Authorize by roles
export const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) return responseHandler.error(res, "Authentication required", 401);
    if (!roles.includes(req.user.role)) return responseHandler.error(res, "Insufficient permissions", 403);
    next();
  };
};

// Check diary ownership for sensitive routes
export const diaryOwnership = async (req, res, next) => {
  try {
    const entryId = parseInt(req.params.id);
    if (isNaN(entryId)) return responseHandler.error(res, "Invalid diary entry ID", 400);

    const userId = req.user.id;
    const userRole = req.user.role;

    // Pass all required arguments
    const diaryEntry = await diaryService.getDiaryEntryById(entryId, userId, userRole);

    // Ownership/access check is already handled in service
    req.diaryEntry = diaryEntry;
    next();
  } catch (error) {
    if (error.message.includes("not found")) return responseHandler.error(res, error.message, 404);
    if (error.message.includes("Access denied")) return responseHandler.error(res, error.message, 403);
    return responseHandler.error(res, error.message, 500);
  }
};
