import express from "express";
import { uploadCSV } from "../controllers/csvController.js";
import { upload } from "../middleware/uploadMiddleware.js";
import { getStudents } from "../controllers/studentController.js"; // ✅ ADD THIS

const router = express.Router();

router.get("/", getStudents);

// existing upload route
router.post("/upload", upload.single("file"), uploadCSV);

export default router;