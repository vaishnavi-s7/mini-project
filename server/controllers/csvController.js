import csv from "csv-parser";
import fs from "fs";
import Student from "../models/Student.js";
import Subject from "../models/Subject.js";
import Course from "../models/Course.js";
import Lesson from "../models/Lesson.js";
import User from "../models/User.js";
 
const safeUnlink = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};
 
const normalizeType = (type) => (type || "student").toString().trim().toLowerCase();
 
const normalizeRow = (row) => {
  const normalized = {};
 
  Object.keys(row).forEach((key) => {
    normalized[key.trim().toLowerCase()] = row[key]?.toString().trim();
  });
 
  return normalized;
};
 
const requiredHeadersMatch = (receivedHeaders, expectedHeaders) =>
  expectedHeaders.every((header) => receivedHeaders.includes(header));
 
const normalizeValue = (value) => String(value || "").trim().toLowerCase();
 
const normalizeSubjectName = (value) => String(value || "").trim();
const normalizeSubjectCode = (value) => String(value || "").trim().toUpperCase();
 
const canTeacherManageSubject = (teacher, subject) => {
  if (teacher?.role !== "TEACHER") {
    return true;
  }
 
  const assignedSubject = normalizeValue(teacher.subject);
 
  return (
    assignedSubject &&
    (assignedSubject === normalizeValue(subject?.subject_name) ||
      assignedSubject === normalizeValue(subject?.subject_code))
  );
};
 
export const uploadCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
 
    const type = normalizeType(req.body.type);
    const results = [];
 
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (row) => {
        results.push(normalizeRow(row));
      })
      .on("error", async (error) => {
        safeUnlink(req.file.path);
        return res.status(500).json({ message: error.message });
      })
      .on("end", async () => {
        try {
          if (results.length === 0) {
            safeUnlink(req.file.path);
            return res.status(400).json({ message: "CSV file is empty" });
          }
 
          const expectedHeadersMap = {
            student: ["name", "email", "grade", "section"],
            subject: ["subject_name", "subject_code", "description"],
            course: ["subjectcode", "name", "code", "description"],
            lesson: ["coursecode", "title", "code", "description"],
          };
 
          const expectedHeaders = expectedHeadersMap[type];
 
          if (!expectedHeaders) {
            safeUnlink(req.file.path);
            return res.status(400).json({
              message: "Invalid CSV type",
            });
          }
 
          const requester = await User.findById(req.user?.id).select("role subject");
 
          if (!requester || !["HOD", "TEACHER"].includes(requester.role)) {
            safeUnlink(req.file.path);
            return res.status(403).json({
              message: "Only HODs and teachers can upload CSV files",
            });
          }
 
          if (requester.role === "TEACHER" && type === "subject") {
            safeUnlink(req.file.path);
            return res.status(403).json({
              message: "Subject bulk upload is available to HOD only",
            });
          }
 
          const receivedHeaders = Object.keys(results[0]);
          const isValidHeaders = requiredHeadersMatch(
            receivedHeaders,
            expectedHeaders
          );
 
          if (!isValidHeaders) {
            safeUnlink(req.file.path);
            return res.status(400).json({
              message: `Invalid headers for ${type}`,
            });
          }
 
          let inserted = 0;
          const errorRows = [];
 
          if (type === "student") {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const validRows = [];
 
            for (let i = 0; i < results.length; i++) {
              const row = results[i];
              const errors = [];
 
              if (!row.name) errors.push("Name is required");
              if (!row.email || !emailRegex.test(row.email)) {
                errors.push("Invalid email");
              }
 
              const grade = parseInt(row.grade, 10);
              if (Number.isNaN(grade) || grade < 1 || grade > 10) {
                errors.push("Invalid grade");
              }
 
              if (!/^[A-D]$/i.test(row.section)) {
                errors.push("Invalid section");
              }
 
              if (errors.length > 0) {
                errorRows.push({ row: i + 1, data: row, errors });
              } else {
                validRows.push({
                  name: row.name,
                  email: row.email,
                  grade,
                  section: row.section.toUpperCase(),
                });
              }
            }
 
            const existing = await Student.find({
              email: { $in: validRows.map((r) => r.email) },
            });
 
            const existingEmails = existing.map((e) => e.email);
            const uniqueRows = validRows.filter(
              (row) => !existingEmails.includes(row.email)
            );
            const duplicateCount = validRows.length - uniqueRows.length;
 
            if (uniqueRows.length > 0) {
              const finalRows = uniqueRows.map((row, i) => ({
                student_id: "STU" + Date.now() + i,
                name: row.name,
                email: row.email,
                grade: row.grade,
                section: row.section,
                sequence_number: Date.now() + i,
              }));
 
              const insertedDocs = await Student.insertMany(finalRows);
              inserted = insertedDocs.length;
            }
 
            safeUnlink(req.file.path);
 
            return res.json({
              success: true,
              inserted,
              duplicates: duplicateCount,
              errors: errorRows,
            });
          }
 
          if (type === "subject") {
            const validRows = [];
            let duplicateCount = 0;
            const seenNames = new Set();
            const seenCodes = new Set();
 
            for (let i = 0; i < results.length; i++) {
              const row = results[i];
              const errors = [];
              const subjectName = normalizeSubjectName(row.subject_name);
              const subjectCode = normalizeSubjectCode(row.subject_code);
              const normalizedNameKey = normalizeValue(subjectName);
              let hasDuplicate = false;
 
              if (!subjectName) errors.push("Subject name is required");
              if (!subjectCode) errors.push("Subject code is required");
 
              if (subjectName && seenNames.has(normalizedNameKey)) {
                errors.push("Duplicate subject name in CSV");
                hasDuplicate = true;
              }
 
              if (subjectCode && seenCodes.has(subjectCode)) {
                errors.push("Duplicate subject code in CSV");
                hasDuplicate = true;
              }
 
              if (hasDuplicate) {
                duplicateCount++;
              }
 
              if (errors.length > 0) {
                errorRows.push({ row: i + 1, data: row, errors });
              } else {
                seenNames.add(normalizedNameKey);
                seenCodes.add(subjectCode);
                validRows.push({
                  row: {
                    subject_name: subjectName,
                    subject_code: subjectCode,
                    description: row.description?.trim() || "",
                  },
                  index: i,
                });
              }
            }
 
            const existingSubjects =
              validRows.length > 0
                ? await Subject.find({
                    $or: [
                      {
                        subject_name: {
                          $in: validRows.map(({ row }) => row.subject_name),
                        },
                      },
                      {
                        subject_code: {
                          $in: validRows.map(({ row }) => row.subject_code),
                        },
                      },
                    ],
                  })
                    .collation({ locale: "en", strength: 2 })
                    .select("subject_name subject_code")
                : [];
 
            const existingNames = new Set(
              existingSubjects.map((subject) => normalizeValue(subject.subject_name))
            );
            const existingCodes = new Set(
              existingSubjects.map((subject) => normalizeSubjectCode(subject.subject_code))
            );
 
            for (let i = 0; i < validRows.length; i++) {
              const { row, index } = validRows[i];
              const errors = [];
 
              if (existingNames.has(normalizeValue(row.subject_name))) {
                errors.push("Subject name already exists");
              }
 
              if (existingCodes.has(row.subject_code)) {
                errors.push("Subject code already exists");
              }
 
              if (errors.length > 0) {
                duplicateCount++;
                errorRows.push({
                  row: index + 1,
                  data: row,
                  errors,
                });
                continue;
              }
 
              try {
                await Subject.create({
                  subject_id: "SUB" + Date.now() + i,
                  subject_name: row.subject_name,
                  subject_code: row.subject_code,
                  description: row.description,
                  sequence_number: Date.now() + i,
                });
 
                inserted++;
              } catch (err) {
                if (err.code === 11000) {
                  duplicateCount++;
                }
 
                errorRows.push({
                  row: index + 1,
                  data: row,
                  errors: [
                    err.code === 11000
                      ? "Subject name or subject code already exists"
                      : err.message,
                  ],
                });
              }
            }
 
            safeUnlink(req.file.path);
 
            return res.json({
              success: true,
              inserted,
              duplicates: duplicateCount,
              errors: errorRows,
            });
          }
 
          if (type === "course") {
            for (let i = 0; i < results.length; i++) {
              const row = results[i];
 
              try {
                const subjectCode = row.subjectcode?.trim().toUpperCase();
                const courseCode = row.code?.trim().toUpperCase();
 
                if (!subjectCode) {
                  throw new Error("Subject code is required");
                }
 
                if (!row.name) {
                  throw new Error("Course name is required");
                }
 
                if (!courseCode) {
                  throw new Error("Course code is required");
                }
 
                const subject = await Subject.findOne({
                  subject_code: subjectCode,
                });
 
                if (!subject) {
                  throw new Error("Invalid subjectCode");
                }
 
                if (!canTeacherManageSubject(requester, subject)) {
                  throw new Error("You have not registered for this subject");
                }
 
                await Course.create({
                  course_id: "COURSE" + Date.now() + i,
                  course_name: row.name,
                  course_code: courseCode,
                  description: row.description || "",
                  subject: subject._id,
                  sequence_number: Date.now() + i,
                });
 
                inserted++;
              } catch (err) {
                errorRows.push({
                  row: i + 1,
                  data: row,
                  errors: [err.message],
                });
              }
            }
 
            safeUnlink(req.file.path);
 
            return res.json({
              success: true,
              inserted,
              duplicates: 0,
              errors: errorRows,
            });
          }
 
          if (type === "lesson") {
            for (let i = 0; i < results.length; i++) {
              const row = results[i];
 
              try {
                const courseCode = row.coursecode?.trim().toUpperCase();
 
                if (!courseCode) {
                  throw new Error("Course code is required");
                }
 
                if (!row.title) {
                  throw new Error("Lesson title is required");
                }
 
                if (!row.code) {
                  throw new Error("Lesson code is required");
                }
 
                const course = await Course.findOne({
                  course_code: courseCode,
                }).populate("subject", "subject_name subject_code");
 
                if (!course) {
                  throw new Error("Invalid courseCode");
                }
 
                if (!canTeacherManageSubject(requester, course.subject)) {
                  throw new Error("You have not registered for this subject");
                }
 
                await Lesson.create({
                  lesson_id: "LESSON" + Date.now() + i,
                  lesson_title: row.title,
                  lesson_code: row.code?.trim().toUpperCase(),
                  description: row.description || "",
                  course: course._id,
                  sequence_number: Date.now() + i,
                  lesson_order: i + 1,
                });
 
                inserted++;
              } catch (err) {
                console.log("LESSON ERROR:", err.message);
                errorRows.push({
                  row: i + 1,
                  data: row,
                  errors: [err.message],
                });
              }
            }
 
            safeUnlink(req.file.path);
 
            return res.json({
              success: true,
              inserted,
              duplicates: 0,
              errors: errorRows,
            });
          }
 
          safeUnlink(req.file.path);
          return res.status(400).json({
            message: "Unsupported CSV type",
          });
        } catch (error) {
          console.error(error);
          safeUnlink(req.file.path);
          return res.status(500).json({ message: error.message });
        }
      });
  } catch (error) {
    console.error(error);
 
    if (req.file) {
      safeUnlink(req.file.path);
    }
 
    res.status(500).json({ message: error.message });
  }
};
 
 