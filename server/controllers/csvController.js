import csv from "csv-parser";
import fs from "fs";
import Student from "../models/Student.js";
import Subject from "../models/Subject.js";
import Course from "../models/Course.js";
import Lesson from "../models/Lesson.js";

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

            for (let i = 0; i < results.length; i++) {
              const row = results[i];
              const errors = [];

              if (!row.subject_name) errors.push("Subject name is required");
              if (!row.subject_code) errors.push("Subject code is required");

              if (errors.length > 0) {
                errorRows.push({ row: i + 1, data: row, errors });
              } else {
                validRows.push({ row, index: i });
              }
            }

            for (let i = 0; i < validRows.length; i++) {
              const { row, index } = validRows[i];

              try {
                await Subject.create({
                  subject_id: "SUB" + Date.now() + i,
                  subject_name: row.subject_name,
                  subject_code: row.subject_code,
                  description: row.description || "",
                  sequence_number: Date.now() + i,
                });

                inserted++;
              } catch (err) {
                errorRows.push({
                  row: index + 1,
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
                });

                if (!course) {
                  throw new Error("Invalid courseCode");
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
