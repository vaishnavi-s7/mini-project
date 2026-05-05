import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendOTPEmail } from "../services/emailService.js";

/**
 * Check whether a password satisfies the app's minimum security rules.
 */
const isValidPassword = (password) => {
  return (
    password.length >= 6 &&
    password.length <= 24 &&
    /[A-Z]/.test(password) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(password)
  );
};

/**
 * Authenticate a user and return a JWT token.
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const hodEmail = String(process.env.HOD_EMAIL || "hod@example.com").trim().toLowerCase();
    const hodPassword = process.env.HOD_PASSWORD || "Password01!";

    if (normalizedEmail === hodEmail) {
      if (password !== hodPassword) {
        return res.status(400).json({ message: "Invalid password" });
      }

      const hashedPassword = await bcrypt.hash(hodPassword, 10);
      const user = await User.findOneAndUpdate(
        { email: normalizedEmail },
        {
          name: process.env.HOD_USERNAME || "Head of Department",
          username: process.env.HOD_USERNAME || "HOD",
          email: normalizedEmail,
          password: hashedPassword,
          role: "HOD",
          subject: undefined,
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      ).select("-password -otp -otpExpiry -lastOtpSent");

      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      return res.json({ token, user });
    }

    const user = await User.findOne({ email: normalizedEmail });

    // Reject unknown users early to avoid leaking extra account details.
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const safeUser = user.toObject();
    delete safeUser.password;
    delete safeUser.otp;
    delete safeUser.otpExpiry;
    delete safeUser.lastOtpSent;

    res.json({ token, user: safeUser });
  } catch (error) {
    console.log("LOGIN ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Generate and email an OTP for password reset.
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    // If the account does not exist, stop the reset flow immediately.
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    // Keep the resend expiry aligned with the original OTP flow.
    user.otpExpiry = Date.now() + 2 * 60 * 1000;
    user.lastOtpSent = Date.now();

    await user.save();

    await sendOTPEmail(email, otp);

    console.log("🔢 OTP:", otp);

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.log("FORGOT PASSWORD ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Resend a password reset OTP while enforcing a short cooldown.
 */
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    // If the account does not exist, stop the resend flow immediately.
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Do not resend if the user is still inside the cooldown window.
    if (user.lastOtpSent && Date.now() - user.lastOtpSent < 30000) {
      return res.status(400).json({
        message: "Wait 30 seconds before resending OTP",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpiry = Date.now() + 2 * 60 * 1000;// ✅ SAME as forgotPassword
    user.lastOtpSent = Date.now();

    await user.save();

    await sendOTPEmail(email, otp);

    console.log("🔁 RESENT OTP:", otp);

    res.json({ message: "OTP resent successfully" });
  } catch (error) {
    console.log("RESEND OTP ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Verify the OTP and update the user's password.
 */
export const resetPassword = async (req, res) => {
  try {
    let { email, otp, newPassword } = req.body;

    // Normalize the OTP before matching it against the stored value.
    otp = otp.trim();

    // Validate the new password before looking up the account.
    if (!isValidPassword(newPassword)) {
      return res.status(400).json({
        message:
          "Password must be 6-24 chars, include uppercase and special character",
      });
    }

    const user = await User.findOne({
      email,
      otp,
      otpExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);

    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.log("RESET PASSWORD ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};
/**
 * Return the authenticated user's profile without the password field.
 */
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    res.json(user);
  } catch (error) {
    console.log("GET PROFILE ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Update editable profile fields for the authenticated user.
 */
export const updateProfile = async (req, res) => {
  try {
    const { phone, age, address, grade, section } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { phone, age, address, grade, section },
      { new: true }
    ).select("-password");

    res.json({
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    console.log("UPDATE PROFILE ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Change the authenticated user's password after verifying the current one.
 */
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);

    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    // Block the update when the current password does not match.
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
