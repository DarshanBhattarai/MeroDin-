// src/routes/auth.routes.js
import express from "express";
import {
  register,
  verifyEmailOTP,
  login,
  refreshTokens,
  logout,
  requestPasswordReset,
  resetPassword,
  resendOTP,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/verify-email-otp", verifyEmailOTP);
router.post("/login", login);
router.post("/refresh", refreshTokens);
router.post("/logout", logout);
router.post("/request-password-reset", requestPasswordReset);
router.post("/reset-password", resetPassword);
router.post("/resend-otp", resendOTP);

export default router;
