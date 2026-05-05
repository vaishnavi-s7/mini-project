import express from "express";
import cors from "cors";

import studentRoutes from "./routes/studentRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import subjectRoutes from "./routes/subjectRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import teacherRoutes from "./routes/teacherRoutes.js";
import lessonRoutes from "./routes/lessonRoutes.js"; // ✅ ADD THIS

const app = express();

/**
 * Register global middleware and API routes.
 */
app.use(cors());
app.use(express.json());

app.use("/api/students", studentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/lessons", lessonRoutes); 
app.use("/api/teachers", teacherRoutes);

export default app;
