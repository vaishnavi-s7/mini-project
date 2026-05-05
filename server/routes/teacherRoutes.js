import express from "express";
import { createTeacher, getTeachers } from "../controllers/teacherController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", protect, requireRole("HOD"), getTeachers);
router.post("/", protect, requireRole("HOD"), createTeacher);

export default router;
