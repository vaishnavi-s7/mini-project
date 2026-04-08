import express from "express";
import {
  register,
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

// ================= AUTH =================
router.post("/register", register);
router.post("/login", login);

// ================= PASSWORD RESET =================
router.post("/forgot-password", forgotPassword);
router.post("/resend-otp", resendOTP);
router.post("/reset-password", resetPassword);

// ================= PROFILE =================
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

// ================= CHANGE PASSWORD =================
router.put("/change-password", protect, changePassword);

export default router;