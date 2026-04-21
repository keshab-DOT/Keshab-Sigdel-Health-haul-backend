import express from "express";
import multer from "multer";
import path from "path";
import auth from "../middleware/authMiddleware.js";
import {getChatUsers, getMessages, sendMessage, deleteMessage, getUnreadCount,} from "../controllers/chatcontroller.js";

const router = express.Router();

// chat image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    if (
      allowed.test(path.extname(file.originalname).toLowerCase()) &&
      allowed.test(file.mimetype)
    )
      cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});


router.get("/users", auth(), getChatUsers);
router.get("/messages/:userId", auth(), getMessages);
router.post("/send/:userId", auth(), upload.single("image"), sendMessage);
router.delete("/messages/:messageId", auth(), deleteMessage);
router.get("/unread-count", auth(), getUnreadCount);

export default router;
