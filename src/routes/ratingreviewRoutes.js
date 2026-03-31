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

// Public: anyone can view reviews for a specific pharmacy 
router.get("/pharmacy/:pharmacyId", getPharmacyReviews);

// User: submit a review (must have a delivered order from that pharmacy)
router.post("/", auth(), roleBasedAuth([USER]), createReview);

// User / Admin: delete a review
router.delete("/:reviewId", auth(), roleBasedAuth([USER, ADMIN]), deleteReview);

// Pharmacy: see only their own reviews
router.get("/my", auth(), roleBasedAuth([PHARMACY]), getMyPharmacyReviews);

// Admin: see all reviews across all pharmacies 
router.get("/admin/all", auth(), roleBasedAuth([ADMIN]), getAllReviews);

export default router;