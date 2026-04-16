import express from "express";
import { uploadCSV } from "../controllers/csvController.js";
import { upload } from "../middleware/uploadMiddleware.js";
import { getStudents } from "../controllers/studentController.js"; // ✅ ADD THIS

const router = express.Router();

/**
 * Return the full student list.
 */
router.get("/", getStudents);

/**
 * Accept a CSV file upload and process it.
 */
router.post("/upload", upload.single("file"), uploadCSV);

export default router;
