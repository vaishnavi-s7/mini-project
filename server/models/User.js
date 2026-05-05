import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    username: { type: String },

    email: { type: String, required: true, unique: true },

    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["HOD", "TEACHER", "STUDENT"],
      default: "STUDENT",
    },

    subject: { type: String },

    // OTP fields
    otp: String,
    otpExpiry: Date,
    lastOtpSent: Date,
    grade: { type: Number },
    section: { type: String },
    age: { type: Number },
    phone: { type: String },
    address: { type: String },
    avatar: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
