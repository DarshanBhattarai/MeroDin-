import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import prisma, { testConnection } from "./lib/prisma.js";
import diaryRoutes from "./routes/diaryRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { errorHandler, requestLogger } from "./middleware/error.middleware.js";
import { corsOptions } from "./config/cors.js";

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Global middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(requestLogger);

// Health check endpoint
app.get("/health", async (req, res) => {
  const isDbConnected = await testConnection();
  res.json({
    status: isDbConnected ? "healthy" : "unhealthy",
    timestamp: new Date().toISOString(),
    database: { connected: isDbConnected },
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/diary", diaryRoutes);

// Error handling
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, async () => {
  try {
    const isConnected = await testConnection();
    if (isConnected) {
      console.log(`
✅ Database connected successfully
🚀 Server running on http://localhost:${PORT}
🔒 Environment: ${process.env.NODE_ENV || "development"}
      `);
    } else {
      throw new Error("Database connection failed");
    }
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
});

// Graceful shutdown
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
