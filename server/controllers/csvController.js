import csv from "csv-parser";
import Student from "../models/Student.js";
import fs from "fs";

export const uploadCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const results = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (row) => {
        const normalized = {};

        Object.keys(row).forEach((k) => {
          normalized[k.trim().toLowerCase()] = row[k]
            ?.toString()
            .trim();
        });

        results.push(normalized);
      })

      .on("end", async () => {
        // ================= HEADER VALIDATION =================
        if (results.length === 0) {
          if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
          }

          return res.status(400).json({
            message: "CSV file is empty",
          });
        }

        const receivedHeaders = Object.keys(results[0]).map((h) =>
          h.trim().toLowerCase()
        );

        const expectedHeaders = ["name", "email", "grade", "section"];

        const isValidHeaders =
          JSON.stringify(receivedHeaders) ===
          JSON.stringify(expectedHeaders);

        if (!isValidHeaders) {
          if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
          }

          return res.status(400).json({
            message:
              "Fields not matching. Check the columns and reupload.",
          });
        }

        const validRows = [];
        const errorRows = [];

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        for (let i = 0; i < results.length; i++) {
          const row = results[i];
          const errors = [];

          // NAME
          if (!row.name || row.name.length === 0) {
            errors.push("Name is required");
          }

          // EMAIL
          if (!row.email || !emailRegex.test(row.email)) {
            errors.push("Invalid email format");
          }

          // GRADE
          const grade = parseInt(row.grade);

          if (
            !row.grade ||
            isNaN(row.grade) ||
            !/^\d+$/.test(row.grade) ||
            grade < 1 ||
            grade > 10
          ) {
            errors.push("Grade must be an integer between 1 and 10");
          }

          // SECTION
          if (!row.section || !/^[A-Da-d]$/.test(row.section)) {
            errors.push("Section must be one of A, B, C, or D");
          }

          if (errors.length > 0) {
            errorRows.push({
              row: i + 1,
              data: row,
              errors,
            });
          } else {
            validRows.push({
              name: row.name,
              email: row.email,
              grade: grade,
              section: row.section.toUpperCase(),
            });
          }
        }

        // ================= DUPLICATE CHECK =================
        const existing = await Student.find({
          email: { $in: validRows.map((r) => r.email) },
        });

        const existingEmails = existing.map((e) => e.email);

        const uniqueRows = validRows.filter(
          (r) => !existingEmails.includes(r.email)
        );

        const duplicateRows = validRows.filter((r) =>
          existingEmails.includes(r.email)
        );

        // ================= INSERT =================
        let insertedCount = 0;

        if (uniqueRows.length > 0) {
          const inserted = await Student.insertMany(uniqueRows);
          insertedCount = inserted.length;
        }

        // ================= CLEANUP =================
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }

        return res.json({
          success: true,
          inserted: insertedCount,
          duplicates: duplicateRows.length,
          errors: errorRows,
        });
      });
  } catch (error) {
    console.error(error);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ message: error.message });
  }
};