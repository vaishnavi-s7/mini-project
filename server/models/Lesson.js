import mongoose from "mongoose";
 
const lessonSchema = new mongoose.Schema(
  {
    lesson_id: {
      type: String,
      required: true,
      unique: true,
    },
    lesson_title: {
      type: String,
      required: true,
      trim: true,
    },
    lesson_code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    lesson_order: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    question_bank: [
      {
        title: {
          type: String,
          default: "",
          trim: true,
        },
        content: {
          type: String,
          default: "",
          trim: true,
        },
      },
    ],
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
 
export default mongoose.model("Lesson", lessonSchema);
 
