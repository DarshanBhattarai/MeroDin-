// src/middleware/admin.middleware.js
import { AuthenticationError } from "../utils/errors.js";

export const adminOnly = (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN') {
      throw new AuthenticationError("Admin access required");
    }
    next();
  } catch (err) {
    next(err);
  }
};