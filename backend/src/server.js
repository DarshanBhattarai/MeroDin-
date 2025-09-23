import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool, { query, validateConnection } from "./db.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Health check route
app.get("/health", async (req, res, next) => {
  try {
    const result = await query("SELECT NOW() as time");
    const dbConnected = await validateConnection();

    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: {
        connected: dbConnected,
        serverTime: result.rows[0].time,
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
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.info("SIGTERM signal received.");
  server.close(async () => {
    console.log("Server closed.");
    await pool.end();
    console.log("Database pool terminated.");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.info("SIGINT signal received.");
  server.close(async () => {
    console.log("Server closed.");
    await pool.end();
    console.log("Database pool terminated.");
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
