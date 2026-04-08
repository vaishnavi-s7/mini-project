import express from "express";
import {
  createCourse,
  getCourses,
  updateCourse,
} from "../controllers/courseController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getCourses);
router.post("/", protect, createCourse);
router.put("/:id", protect, updateCourse);

export default router;
