import express from "express";
import {
  deleteCourse,
  createCourse,
  getCourses,
  updateCourse,
} from "../controllers/courseController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * Read, create, update, and delete course records.
 */
router.get("/", protect, getCourses);
router.post("/", protect, createCourse);
router.delete("/:id", protect, deleteCourse);
router.put("/:id", protect, updateCourse);

export default router;
