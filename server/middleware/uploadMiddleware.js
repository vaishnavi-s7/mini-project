import multer from "multer";
import path from "path";

/**
 * Configure disk storage for uploaded files.
 */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

/**
 * Accept only CSV uploads.
 */
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "text/csv") {
    cb(null, true);
  } else {
    cb(new Error("Only CSV files are allowed"), false);
  }
};

/**
 * Multer instance used for upload endpoints.
 */
export const upload = multer({
  storage,
  fileFilter,
});
