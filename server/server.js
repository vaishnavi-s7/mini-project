import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";
import Student from "./models/Student.js";

/**
 * Log the current student count after startup.
 */
setTimeout(async () => {
  const count = await Student.countDocuments();
  console.log(`📊 Current Student Count in DB: ${count}`);
}, 5000);

dotenv.config();

/**
 * Establish the database connection before accepting requests.
 */
connectDB();

const PORT = process.env.PORT || 5000;

/**
 * Start the HTTP server.
 */
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
