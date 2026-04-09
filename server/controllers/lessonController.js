import Lesson from "../models/Lesson.js";
import Course from "../models/Course.js";
import { resequenceDocuments } from "../utils/resequenceDocuments.js";

const buildLessonId = (sequenceNumber) =>
  `LES${String(sequenceNumber).padStart(3, "0")}`;

export const createLesson = async (req, res) => {
  try {
    const {
      lesson_title,
      lesson_code,
      course,
      lesson_order,
      description,
      question_bank,
      status,
    } = req.body;

    if (!lesson_title?.trim() || !lesson_code?.trim() || !course || !lesson_order) {
      return res.status(400).json({
        message: "Lesson title, lesson code, course, and lesson order are required",
      });
    }

    const existingCourse = await Course.findById(course);

    if (!existingCourse) {
      return res.status(404).json({ message: "Selected course not found" });
    }

    const lessons = await resequenceDocuments(Lesson, buildLessonId, "lesson_id");
    const nextSequence = lessons.length + 1;

    const lessonData = {
      lesson_title: lesson_title.trim(),
      lesson_code: lesson_code.trim().toUpperCase(),
      course,
      lesson_order: Number(lesson_order),
      description: description?.trim() || "",
      question_bank: Array.isArray(question_bank)
        ? question_bank.map((item) => ({
            title: item?.title?.trim() || "",
            content: item?.content?.trim() || "",
          }))
        : [],
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
    await resequenceDocuments(Lesson, buildLessonId, "lesson_id");

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

export const getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate({
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
      success: true,
      data: lesson,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateLesson = async (req, res) => {
  try {
    const {
      lesson_title,
      course,
      lesson_order,
      description,
      question_bank,
      status,
    } = req.body;

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
        question_bank: Array.isArray(question_bank)
          ? question_bank.map((item) => ({
              title: item?.title?.trim() || "",
              content: item?.content?.trim() || "",
            }))
          : undefined,
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

export const updateLessonQuestionBank = async (req, res) => {
  try {
    const { question_bank } = req.body;

    if (!Array.isArray(question_bank)) {
      return res.status(400).json({ message: "Question bank must be an array" });
    }

    const lesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      {
        question_bank: question_bank.map((item) => ({
          title: item?.title?.trim() || "",
          content: item?.content?.trim() || "",
        })),
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
      message: "Question bank updated successfully",
      data: lesson,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const lesson = await Lesson.findById(id);

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    await Lesson.findByIdAndDelete(id);
    await resequenceDocuments(Lesson, buildLessonId, "lesson_id");

    res.json({
      message: "Lesson deleted successfully",
    });
  } catch (error) {
    console.log("DELETE LESSON ERROR:", error);
    res.status(500).json({
      message: "Failed to delete lesson",
    });
  }
};
