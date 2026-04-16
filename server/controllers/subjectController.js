import Subject from "../models/Subject.js";
import Course from "../models/Course.js";
import Lesson from "../models/Lesson.js";
import { resequenceDocuments } from "../utils/resequenceDocuments.js";
 
/**
 * Build the public subject identifier from a sequence number.
 */
const buildSubjectId = (sequenceNumber) =>
  `SUB${String(sequenceNumber).padStart(3, "0")}`;
 
/**
 * Escape user input before using it inside a regular expression.
 */
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
 
/**
 * Create a subject record.
 */
export const createSubject = async (req, res) => {
  try {
    const { subject_name, subject_code, description, status } = req.body;
 
    // Require the fields that identify a subject.
    if (!subject_name?.trim() || !subject_code?.trim()) {
      return res.status(400).json({
        message: "Subject name and subject code are required",
      });
    }
 
    const trimmedName = subject_name.trim();
    const normalizedCode = subject_code.trim().toUpperCase();
    const trimmedDescription = description?.trim() || "";
    const normalizedStatus = status === "Inactive" ? "Inactive" : "Active";
 
    const existingSubject = await Subject.findOne({
      $or: [
        {
          subject_name: {
            $regex: `^${escapeRegex(trimmedName)}$`,
            $options: "i",
          },
        },
        { subject_code: normalizedCode },
      ],
    });
 
    // Block duplicate subject names or codes.
    if (existingSubject) {
      return res.status(409).json({
        message: "Subject name or subject code already exists",
      });
    }
 
    const subjects = await resequenceDocuments(
      Subject,
      buildSubjectId,
      "subject_id"
    );
    const nextSequence = subjects.length + 1;
 
    const subject = await Subject.create({
      subject_id: buildSubjectId(nextSequence),
      subject_name: trimmedName,
      subject_code: normalizedCode,
      description: trimmedDescription,
      status: normalizedStatus,
      sequence_number: nextSequence,
    });
 
    res.status(201).json({
      message: "Subject created successfully",
      data: subject,
    });
  } catch (error) {
    console.log("CREATE SUBJECT ERROR:", error);
 
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Subject already exists. Please use a different name or code.",
      });
    }
 
    res.status(500).json({
      message: "Failed to save subject",
    });
  }
};
 
/**
 * Return all subjects in sequence order.
 */
export const getSubjects = async (_req, res) => {
  try {
    const subjects = await resequenceDocuments(
      Subject,
      buildSubjectId,
      "subject_id"
    );

    res.json({
      success: true,
      data: subjects,
    });
  } catch (error) {
    console.log("GET SUBJECTS ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch subjects",
    });
  }
};
 
/**
 * Update an existing subject.
 */
export const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject_name, description, status } = req.body;
 
    // Require a subject name before updating the record.
    if (!subject_name?.trim()) {
      return res.status(400).json({
        message: "Subject name is required",
      });
    }
 
    if (!["Active", "Inactive"].includes(status)) {
      return res.status(400).json({
        message: "Status must be either Active or Inactive",
      });
    }
 
    const trimmedName = subject_name.trim();
    const trimmedDescription = description?.trim() || "";
 
    const duplicateSubject = await Subject.findOne({
      _id: { $ne: id },
      subject_name: {
        $regex: `^${escapeRegex(trimmedName)}$`,
        $options: "i",
      },
    });
 
    // Prevent renaming the subject to an existing one.
    if (duplicateSubject) {
      return res.status(409).json({
        message: "Subject name already exists",
      });
    }
 
    const subject = await Subject.findByIdAndUpdate(
      id,
      {
        subject_name: trimmedName,
        description: trimmedDescription,
        status,
      },
      { new: true, runValidators: true }
    );
 
    if (!subject) {
      return res.status(404).json({
        message: "Subject not found",
      });
    }
 
    res.json({
      message: "Subject updated successfully",
      data: subject,
    });
  } catch (error) {
    console.log("UPDATE SUBJECT ERROR:", error);
    res.status(500).json({
      message: "Failed to update subject",
    });
  }
};

/**
 * Delete a subject and cascade its dependent courses and lessons.
 */
export const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findById(id);

    // Return 404 when the subject cannot be located.
    if (!subject) {
      return res.status(404).json({
        message: "Subject not found",
      });
    }

    const courses = await Course.find({ subject: id }).select("_id");
    const courseIds = courses.map((course) => course._id);

    if (courseIds.length > 0) {
      await Lesson.deleteMany({ course: { $in: courseIds } });
      await Course.deleteMany({ subject: id });
    }

    await Subject.findByIdAndDelete(id);

    await resequenceDocuments(Subject, buildSubjectId, "subject_id");
    await resequenceDocuments(
      Course,
      (sequenceNumber) => `CRS${String(sequenceNumber).padStart(3, "0")}`,
      "course_id"
    );
    await resequenceDocuments(
      Lesson,
      (sequenceNumber) => `LES${String(sequenceNumber).padStart(3, "0")}`,
      "lesson_id"
    );

    res.json({
      message: "Subject deleted successfully",
    });
  } catch (error) {
    console.log("DELETE SUBJECT ERROR:", error);
    res.status(500).json({
      message: "Failed to delete subject",
    });
  }
};
 
 
