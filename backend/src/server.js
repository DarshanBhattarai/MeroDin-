import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db.js"; // <- connect to DB

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Test route
app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()"); // test query
    res.json({ message: "Backend running!", dbTime: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
