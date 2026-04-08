import express from "express";
import {
  createLesson,
  getLessonById,
  getLessons,
  updateLesson,
  updateLessonQuestionBank,
} from "../controllers/lessonController.js";
import { protect } from "../middleware/authMiddleware.js";
 
const router = express.Router();
 
router.get("/", protect, getLessons);
router.get("/:id", protect, getLessonById);
router.post("/", protect, createLesson);
router.put("/:id", protect, updateLesson);
router.put("/:id/question-bank", protect, updateLessonQuestionBank);
 
export default router;
 
