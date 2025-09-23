import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import prisma, { testConnection } from "./lib/prisma.js";
import diaryRoutes from "./routes/diaryRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/diary", diaryRoutes);

// Health check route
app.get("/health", async (req, res, next) => {
  try {
    const dbConnected = await testConnection();
    const currentTime = await prisma.$queryRaw`SELECT NOW() as time`;

    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: {
        connected: dbConnected,
        serverTime: currentTime[0].time,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Merodin API Server" });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);

  // Test database connection on startup
  try {
    const isConnected = await testConnection();
    if (isConnected) {
      console.log("✅ Database connection established successfully");
    } else {
      console.log("❌ Database connection test failed");
    }
  } catch (error) {
    console.error("❌ Database connection error:", error.message);
  }
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.info("SIGTERM signal received.");
  server.close(async () => {
    console.log("Server closed.");
    await prisma.$disconnect();
    console.log("Database connection closed.");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.info("SIGINT signal received.");
  server.close(async () => {
    console.log("Server closed.");
    await prisma.$disconnect();
    console.log("Database connection closed.");
    process.exit(0);
  });
});

// Global error handler middleware - should be after all routes
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  console.error("Stack:", err.stack);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});
