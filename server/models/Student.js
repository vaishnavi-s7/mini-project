import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    // unique: true
  },

  grade: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },

  section: {
    type: String,
    required: true
  }

}, { timestamps: true });

export default mongoose.model("Student", studentSchema);