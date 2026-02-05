import {Router} from "express";
import errorHandle from "../services/errorHandler.js";
import { createReview } from "../controllers/ratingReviewController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";

const router=Router();
router.route("/").post(isAuthenticated, createReview)

export default router