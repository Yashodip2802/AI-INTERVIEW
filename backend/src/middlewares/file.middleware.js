import multer from "multer";
import path from "path";

const allowedExtensions = [".pdf", ".docx"];
const allowedMimes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/docx",
  "application/msword",
  "application/octet-stream",
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    if (allowedExtensions.includes(ext) || allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF or DOCX files are allowed"));
    }
  },
});

export default upload;
