import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { sendTeacherWelcomeEmail } from "../services/emailService.js";

const DEFAULT_TEACHER_PASSWORD = "Password01!";

/**
 * Create a teacher account. This route is restricted to the HOD.
 */
export const createTeacher = async (req, res) => {
  try {
    const { username, email, subject } = req.body;

    if (!username?.trim() || !email?.trim() || !subject?.trim()) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const hodEmail = String(process.env.HOD_EMAIL || "hod@example.com").trim().toLowerCase();

    if (normalizedEmail === hodEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(DEFAULT_TEACHER_PASSWORD, 10);

    const teacher = await User.create({
      name: username.trim(),
      username: username.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "TEACHER",
      subject: subject.trim(),
    });

    await sendTeacherWelcomeEmail({
      username: teacher.username,
      email: teacher.email,
      password: DEFAULT_TEACHER_PASSWORD,
    });

    res.status(201).json({
      message: "Teacher created successfully",
      data: {
        id: teacher._id,
        username: teacher.username,
        email: teacher.email,
        role: teacher.role,
        subject: teacher.subject,
      },
    });
  } catch (error) {
    console.log("CREATE TEACHER ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};
