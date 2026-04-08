import mongoose from "mongoose";
 
const subjectSchema = new mongoose.Schema(
  {
    subject_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    subject_name: {
      type: String,
      required: true,
      trim: true,
    },
    subject_code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    sequence_number: {
      type: Number,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);
 
export default mongoose.model("Subject", subjectSchema);
 
 
