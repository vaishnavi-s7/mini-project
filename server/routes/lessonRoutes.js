import express from "express";
import { createLesson, getLessons, updateLesson } from "../controllers/lessonController.js";
import { protect } from "../middleware/authMiddleware.js";
 
const router = express.Router();
 
router.get("/", protect, getLessons);
router.post("/", protect, createLesson);
router.put("/:id", protect, updateLesson);
 
export default router;
 