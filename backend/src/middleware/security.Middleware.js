import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

// Rate limiting for diary operations
export const diaryRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many diary operations, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting for sensitive operations
export const sensitiveOperationRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 requests per hour
  message: {
    success: false,
    message: 'Too many sensitive operations, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Security headers middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
});

// CORS configuration
export const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};