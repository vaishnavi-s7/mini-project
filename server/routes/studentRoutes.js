import express from "express";
import { uploadCSV } from "../controllers/csvController.js";
import { upload } from "../middleware/uploadMiddleware.js";
import { createStudent, getStudents } from "../controllers/studentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * Return the full student list.
 */
router.get("/", getStudents);
router.post("/", createStudent);

/**
 * Accept a CSV file upload and process it.
 */
router.post("/upload", protect, upload.single("file"), uploadCSV);

export default router;
