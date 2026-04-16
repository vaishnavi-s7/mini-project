import Student from "../models/Student.js";
import csv from "csv-parser";
import fs from "fs";

/**
 * Upload a student CSV file, deduplicate emails, and persist new rows.
 */
export const uploadStudents = async (req, res) => {
  const results = [];

  // Stream the uploaded file into the CSV parser.
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", async () => {

      try {

        const emails = results.map(r => r.email);

        // Look up rows that already exist before inserting new ones.
        const existingStudents = await Student.find({
          email: { $in: emails }
        });

        const existingEmails = existingStudents.map(s => s.email);

        const newStudents = results.filter(
          student => !existingEmails.includes(student.email)
        );

        const duplicates = results.filter(
          student => existingEmails.includes(student.email)
        );

        await Student.insertMany(newStudents);

        res.json({
          inserted: newStudents.length,
          duplicates: duplicates.length,
          duplicateEmails: duplicates.map(d => d.email)
        });

      } catch (error) {

        // Return a server error when CSV processing fails.
        res.status(500).json({
          message: "Error processing CSV",
          error
        });

      }

    });

};

/**
 * Return the full student list.
 */
export const getStudents = async (req, res) => {
    try {
      const students = await Student.find();

      res.json({
        success: true,
        data: students
      });

    } catch (error) {
      res.status(500).json({
        message: "Error fetching students",
        error
      });
    }
  };
