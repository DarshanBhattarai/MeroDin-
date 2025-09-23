import logger from "../utils/logger.js";

export const requestLogger = (req, res, next) => {
  logger.info("Incoming Request", {
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
  });
  next();
};

export const errorLogger = (err, req, res, next) => {
  logger.error("Error occurred", {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });
  next(err);
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    status: "error",
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
