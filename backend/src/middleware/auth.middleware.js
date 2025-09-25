// src/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import { AuthenticationError } from "../utils/errors.js";

export const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies?.access_token || (req.headers.authorization && req.headers.authorization.split(" ")[1]);
    if (!token) throw new AuthenticationError("No access token");

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (e) {
      throw new AuthenticationError("Invalid or expired token");
    }

    const user = await prisma.user.findUnique({ where: { id: Number(payload.userId) } });
    if (!user) throw new AuthenticationError("User not found");

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};
