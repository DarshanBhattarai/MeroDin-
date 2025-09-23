import pkg from "pg";
import dotenv from "dotenv";

const { Pool } = pkg;

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  "PGUSER",
  "PGHOST",
  "PGDATABASE",
  "PGPASSWORD",
  "PGPORT",
];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`
  );
}

// Create the connection pool
const pool = new Pool({
  // pg automatically uses PGUSER, PGHOST, PGDATABASE, PGPASSWORD, and PGPORT environment variables
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 20,
});

// Handle pool errors
pool.on("error", (err) => {
  console.error("Unexpected error on idle client:", err.message);
  // Don't exit the process, let the application handle the error
});

/**
 * Validates database connection
 * @returns {Promise<boolean>}
 */
export const validateConnection = async () => {
  let client;
  try {
    client = await pool.connect();
    await client.query("SELECT NOW()");
    return true;
  } catch (err) { 
    console.error("Database connection error:", err.message);
    throw err;
  } finally {
    if (client) {
      client.release();
    }
  }
};

// Attempt initial connection
validateConnection()
  .then(() => console.log("Database connection established"))
  .catch(() => console.error("Failed to establish database connection"));

/**
 * Execute a query with automatic client release
 * @param {string} text - The SQL query text
 * @param {Array} params - The query parameters
 * @returns {Promise<QueryResult>}
 */
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (duration > 1000) {
      // Log slow queries (over 1 second)
      console.warn("Slow query:", { text, duration, rows: res.rowCount });
    }
    return res;
  } catch (err) {
    console.error("Query error:", { text, error: err.message });
    throw err;
  }
};

export default pool;
