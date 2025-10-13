// src/controllers/authMe.controller.js
import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";
import { AuthenticationError } from "../utils/errors.js";

export const getCurrentUser = async (req, res, next) => {
  try {
    const token = req.cookies?.access_token;
    if (!token) throw new AuthenticationError("Not authenticated");

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (err) {
      throw new AuthenticationError("Invalid or expired token");
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(payload.userId) },
      select: { id: true, email: true, fullName: true }, // only expose safe fields
    });

    if (!user) throw new AuthenticationError("User not found");

    res.json({ user });
  } catch (err) {
    next(err);
  }
};
