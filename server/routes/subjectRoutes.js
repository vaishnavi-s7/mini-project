import express from "express";
import {
  deleteSubject,
  createSubject,
  getSubjects,
  updateSubject,
} from "../controllers/subjectController.js";
import { protect } from "../middleware/authMiddleware.js";
 
const router = express.Router();
 
router.get("/", protect, getSubjects);
router.post("/", protect, createSubject);
router.delete("/:id", protect, deleteSubject);
router.put("/:id", protect, updateSubject);

export default router;
