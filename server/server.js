import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";
import Student from "./models/Student.js";
setTimeout(async () => {
  const count = await Student.countDocuments();
  console.log(`📊 Current Student Count in DB: ${count}`);
}, 5000);
dotenv.config();

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});