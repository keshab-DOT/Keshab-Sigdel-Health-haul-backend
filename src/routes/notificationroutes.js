import express from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "../controllers/notificationcontroller.js";
import auth         from "../middleware/authMiddleware.js";
import roleBasedAuth from "../middleware/rolebased.js";
import { USER, PHARMACY, ADMIN } from "../constants/roles.js";

const router = express.Router();

// All roles can receive notifications
router.get("/", auth(), roleBasedAuth([USER, PHARMACY, ADMIN]), getNotifications);
router.put("/read-all", auth(), roleBasedAuth([USER, PHARMACY, ADMIN]), markAllAsRead);
router.put("/:id/read", auth(), roleBasedAuth([USER, PHARMACY, ADMIN]), markAsRead);

export default router;