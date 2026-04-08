import Course from "../models/Course.js";
import Subject from "../models/Subject.js";

const buildCourseId = (sequenceNumber) =>
  `CRS${String(sequenceNumber).padStart(3, "0")}`;

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const createCourse = async (req, res) => {
  try {
    const { course_name, course_code, subject, description, status } = req.body;

    if (
      !course_name?.trim() ||
      !course_code?.trim() ||
      !subject?.trim()
    ) {
      return res.status(400).json({
        message: "Course name, course code, and subject are required",
      });
    }

    const existingSubject = await Subject.findById(subject.trim());

    if (!existingSubject) {
      return res.status(404).json({
        message: "Selected subject not found",
      });
    }

    const trimmedName = course_name.trim();
    const normalizedCode = course_code.trim().toUpperCase();
    const trimmedDescription = description?.trim() || "";
    const normalizedStatus = status === "Inactive" ? "Inactive" : "Active";

    const existingCourse = await Course.findOne({
      subject: existingSubject._id,
      $or: [
        {
          course_name: {
            $regex: `^${escapeRegex(trimmedName)}$`,
            $options: "i",
          },
        },
        { course_code: normalizedCode },
      ],
    });

    if (existingCourse) {
      return res.status(409).json({
        message: "Course name or course code already exists for this subject",
      });
    }

    const lastCourse = await Course.findOne().sort({ sequence_number: -1 });
    const nextSequence = (lastCourse?.sequence_number || 0) + 1;

    const course = await Course.create({
      course_id: buildCourseId(nextSequence),
      course_name: trimmedName,
      course_code: normalizedCode,
      subject: existingSubject._id,
      description: trimmedDescription,
      status: normalizedStatus,
      sequence_number: nextSequence,
    });

    const populatedCourse = await Course.findById(course._id).populate(
      "subject",
      "subject_id subject_name subject_code status"
    );

    res.status(201).json({
      message: "Course created successfully",
      data: populatedCourse,
    });
  } catch (error) {
    console.log("CREATE COURSE ERROR:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Course already exists. Please use a different name or code.",
      });
    }

    res.status(500).json({
      message: "Failed to save course",
    });
  }
};

export const getCourses = async (_req, res) => {
  try {
    const courses = await Course.find()
      .populate("subject", "subject_id subject_name subject_code status")
      .sort({ sequence_number: 1 });

    res.json({
      success: true,
      data: courses,
    });
  } catch (error) {
    console.log("GET COURSES ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch courses",
    });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { course_name, subject, description, status } = req.body;

    if (!course_name?.trim() || !subject?.trim()) {
      return res.status(400).json({
        message: "Course name and subject are required",
      });
    }

    if (!["Active", "Inactive"].includes(status)) {
      return res.status(400).json({
        message: "Status must be either Active or Inactive",
      });
    }

    const existingSubject = await Subject.findById(subject.trim());

    if (!existingSubject) {
      return res.status(404).json({
        message: "Selected subject not found",
      });
    }

    const trimmedName = course_name.trim();
    const trimmedDescription = description?.trim() || "";

    const duplicateCourse = await Course.findOne({
      _id: { $ne: id },
      subject: existingSubject._id,
      course_name: {
        $regex: `^${escapeRegex(trimmedName)}$`,
        $options: "i",
      },
    });

    if (duplicateCourse) {
      return res.status(409).json({
        message: "Course name already exists for this subject",
      });
    }

    const course = await Course.findByIdAndUpdate(
      id,
      {
        course_name: trimmedName,
        subject: existingSubject._id,
        description: trimmedDescription,
        status,
      },
      { new: true, runValidators: true }
    ).populate("subject", "subject_id subject_name subject_code status");

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    res.json({
      message: "Course updated successfully",
      data: course,
    });
  } catch (error) {
    console.log("UPDATE COURSE ERROR:", error);
    res.status(500).json({
      message: "Failed to update course",
    });
  }
};
