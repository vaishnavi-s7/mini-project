import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    course_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    course_name: {
      type: String,
      required: true,
      trim: true,
    },
    course_code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
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

export default mongoose.model("Course", courseSchema);
