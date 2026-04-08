import Student from "../models/Student.js";
import csv from "csv-parser";
import fs from "fs";

export const uploadStudents = async (req, res) => {
  const results = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", async () => {

      try {

        const emails = results.map(r => r.email);

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

        res.status(500).json({
          message: "Error processing CSV",
          error
        });

      }

    });

};
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