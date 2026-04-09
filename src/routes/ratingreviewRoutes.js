import express from "express";
import auth          from "../middleware/authMiddleware.js";
import roleBasedAuth from "../middleware/rolebased.js";
import { USER, PHARMACY, ADMIN } from "../constants/roles.js";
import {
  createReview,
  getPharmacyReviews,
  getMyPharmacyReviews,
  getAllReviews,
  deleteReview,
} from "../controllers/ratingreviewcontroller.js";

const router = express.Router();

router.get("/pharmacy/:pharmacyId", getPharmacyReviews);
router.post("/", auth(), roleBasedAuth([USER]), createReview);
router.delete("/:reviewId", auth(), roleBasedAuth([USER, ADMIN]), deleteReview);
router.get("/my", auth(), roleBasedAuth([PHARMACY]), getMyPharmacyReviews);
router.get("/admin/all", auth(), roleBasedAuth([ADMIN]), getAllReviews);

export default router;