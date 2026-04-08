import Lesson from "../models/Lesson.js";
import Course from "../models/Course.js";

const buildLessonId = (sequenceNumber) =>
  `LES${String(sequenceNumber).padStart(3, "0")}`;

export const createLesson = async (req, res) => {
  try {
    const { lesson_title, lesson_code, course, lesson_order, description, status } =
      req.body;

    if (!lesson_title?.trim() || !lesson_code?.trim() || !course || !lesson_order) {
      return res.status(400).json({
        message: "Lesson title, lesson code, course, and lesson order are required",
      });
    }

    const existingCourse = await Course.findById(course);

    if (!existingCourse) {
      return res.status(404).json({ message: "Selected course not found" });
    }

    const lastLesson = await Lesson.findOne().sort({ sequence_number: -1 });
    const nextSequence = (lastLesson?.sequence_number || 0) + 1;

    const lessonData = {
      lesson_title: lesson_title.trim(),
      lesson_code: lesson_code.trim().toUpperCase(),
      course,
      lesson_order: Number(lesson_order),
      description: description?.trim() || "",
      status: status === "Inactive" ? "Inactive" : "Active",
      lesson_id: buildLessonId(nextSequence),
      sequence_number: nextSequence,
    };

    const lesson = await Lesson.create(lessonData);
    const populatedLesson = await Lesson.findById(lesson._id).populate({
      path: "course",
      select: "course_id course_name course_code status subject",
      populate: {
        path: "subject",
        select: "subject_id subject_name subject_code status",
      },
    });

    res.status(201).json({
      message: "Lesson created successfully",
      data: populatedLesson,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getLessons = async (_req, res) => {
  try {
    const lessons = await Lesson.find()
      .populate({
        path: "course",
        select: "course_id course_name course_code status subject",
        populate: {
          path: "subject",
          select: "subject_id subject_name subject_code status",
        },
      })
      .sort({ sequence_number: 1 });

    res.json({
      success: true,
      data: lessons,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateLesson = async (req, res) => {
  try {
    const { lesson_title, course, lesson_order, description, status } = req.body;

    if (!lesson_title?.trim() || !course || !lesson_order) {
      return res.status(400).json({
        message: "Lesson title, course, and lesson order are required",
      });
    }

    const lesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      {
        lesson_title: lesson_title.trim(),
        course,
        lesson_order: Number(lesson_order),
        description: description?.trim() || "",
        status,
      },
      { new: true }
    ).populate({
      path: "course",
      select: "course_id course_name course_code status subject",
      populate: {
        path: "subject",
        select: "subject_id subject_name subject_code status",
      },
    });

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    res.json({
      message: "Lesson updated successfully",
      data: lesson,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
