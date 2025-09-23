import { AuthenticationError } from "../utils/errors.js";
import { verifyToken } from "../utils/auth.js";
import { extractTokenFromHeader } from "../utils/middleware-helpers.js";
import prisma from "../lib/prisma.js";

export const authenticate = async (req, res, next) => {
  try {
    const token = extractTokenFromHeader(req);
    const decoded = verifyToken(token);

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      throw new AuthenticationError("User not found");
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    next(new AuthenticationError(error.message));
  }
};

export const isOwner = (resourceKey = "userId") => {
  return (req, res, next) => {
    if (req.user.id !== req[resourceKey]) {
      throw new AuthenticationError("Not authorized to access this resource");
    }
    next();
  };
};
