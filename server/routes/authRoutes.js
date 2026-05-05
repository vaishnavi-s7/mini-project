import express from "express";
import {
  login,
  forgotPassword,
  resetPassword,
  resendOTP,
  getProfile,
  updateProfile,
  changePassword,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * Authentication route. Account creation is handled by HOD-only APIs.
 */
router.post("/login", login);

/**
 * Password reset routes for OTP generation and verification.
 */
router.post("/forgot-password", forgotPassword);
router.post("/resend-otp", resendOTP);
router.post("/reset-password", resetPassword);

/**
 * Profile routes that require a valid bearer token.
 */
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

/**
 * Update the authenticated user's password.
 */
router.put("/change-password", protect, changePassword);

export default router;
