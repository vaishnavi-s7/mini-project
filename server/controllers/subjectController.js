import Subject from "../models/Subject.js";
 
const buildSubjectId = (sequenceNumber) =>
  `SUB${String(sequenceNumber).padStart(3, "0")}`;
 
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
 
export const createSubject = async (req, res) => {
  try {
    const { subject_name, subject_code, description, status } = req.body;
 
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
 
    if (existingSubject) {
      return res.status(409).json({
        message: "Subject name or subject code already exists",
      });
    }
 
    const lastSubject = await Subject.findOne().sort({ sequence_number: -1 });
    const nextSequence = (lastSubject?.sequence_number || 0) + 1;
 
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
 
export const getSubjects = async (_req, res) => {
  try {
    const subjects = await Subject.find().sort({ sequence_number: 1 });
 
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
 
export const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject_name, description, status } = req.body;
 
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
 
 
