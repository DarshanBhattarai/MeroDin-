import { AuthenticationError } from "./errors.js";
import { verifyToken } from "./auth.js";

export const extractTokenFromHeader = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AuthenticationError("No token provided");
  }
  return authHeader.split(" ")[1];
};

export const validateEnvVariables = (requiredVars) => {
  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`
    );
  }
};

export const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later",
};

export const corsConfig = {
  origin: process.env.CORS_ORIGIN || "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["X-Total-Count"],
  credentials: true,
  maxAge: 600, // 10 minutes
};

export const validateRequestSchema = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: "error",
        message: "Validation error",
        errors: error.details.map((detail) => detail.message),
      });
    }
    next();
  };
};
