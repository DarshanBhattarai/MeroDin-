import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import prisma, { testConnection } from "./lib/prisma.js";
import diaryRoutes from "./routes/diaryRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { errorHandler, requestLogger } from "./middleware/error.middleware.js";
import { corsOptions } from "./config/cors.js";
import { authenticate } from "./middleware/auth.middleware.js";

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: "Too many requests from this IP, please try again later",
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/request-password-reset", authLimiter);
app.use("/api/auth/verify-email-otp", authLimiter);

app.get("/health", async (req, res) => {
  const isDbConnected = await testConnection();
  res.json({
    status: isDbConnected ? "healthy" : "unhealthy",
    timestamp: new Date().toISOString(),
    database: { connected: isDbConnected },
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/diary", diaryRoutes);

app.get("/api/profile", authenticate, (req, res) => {
  const { password: _, ...userWithoutPassword } = req.user;
  res.json({ user: userWithoutPassword });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, async () => {
  try {
    const isConnected = await testConnection();
    if (isConnected) {
      console.log(`✅ Database connected
🚀 Server running on http://localhost:${PORT}
🔒 Environment: ${process.env.NODE_ENV || "development"}`);
    } else {
      throw new Error("Database connection failed");
    }
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
});

const handleShutdown = async () => {
  console.log("Initiating graceful shutdown...");
  server.close(async () => {
    await prisma.$disconnect();
    console.log("Server shutdown completed");
    process.exit(0);
  });
};
process.on("SIGTERM", handleShutdown);
process.on("SIGINT", handleShutdown);
