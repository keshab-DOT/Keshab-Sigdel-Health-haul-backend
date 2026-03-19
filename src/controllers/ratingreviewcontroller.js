import Order from "../models/order.js";
import RatingReview from "../models/ratingreviewmodel.js";
import Product      from "../models/product.js";

export const createReview = async (req, res) => {
  try {
    const userId     = req.user._id;
    const { pharmacyId, rating, comment } = req.body;

    if (!pharmacyId || !rating) {
      return res.status(400).json({ message: "pharmacyId and rating are required." });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5." });
    }

    // Check: user hasn't already reviewed this pharmacy
    const existing = await RatingReview.findOne({ userId, pharmacyId });
    if (existing) {
      return res.status(400).json({ message: "You have already reviewed this pharmacy." });
    }

    // find a delivered order where at least one product belongs to this pharmacy
    const deliveredOrders = await Order.find({
      userId,
      orderStatus: "delivered",
    }).populate("products.productId", "userId");

    const qualifyingOrder = deliveredOrders.find(order =>
      order.products.some(item =>
        item.productId?.userId?.toString() === pharmacyId.toString()
      )
    );

    if (!qualifyingOrder) {
      return res.status(403).json({
        message: "You can only review a pharmacy after receiving a delivered order from them.",
      });
    }

    const review = await RatingReview.create({
      userId,
      pharmacyId,
      orderId: qualifyingOrder._id,
      rating,
      comment: comment || "",
    });

    // Populate user name for the response so frontend can display it immediately
    await review.populate("userId", "name");

    return res.status(201).json({
      message: "Review submitted successfully.",
      data: review,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "You have already reviewed this pharmacy." });
    }
    console.error("createReview error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/reviews/pharmacy/:pharmacyId
export const getPharmacyReviews = async (req, res) => {
  try {
    const { pharmacyId } = req.params;

    const reviews = await RatingReview.find({ pharmacyId })
      .populate("userId", "name")
      .sort({ createdAt: -1 });

    const totalCount = reviews.length;
    const averageRating =
      totalCount > 0
        ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / totalCount) * 10) / 10
        : 0;

    return res.status(200).json({
      reviews,
      totalCount,
      averageRating,
    });
  } catch (error) {
    console.error("getPharmacyReviews error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PHARMACY gets all reviews for their own pharmacy only.
export const getMyPharmacyReviews = async (req, res) => {
  try {
    const pharmacyId = req.user._id;

    const reviews = await RatingReview.find({ pharmacyId })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    const totalCount = reviews.length;
    const averageRating =
      totalCount > 0
        ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / totalCount) * 10) / 10
        : 0;

    return res.status(200).json({ reviews, totalCount, averageRating });
  } catch (error) {
    console.error("getMyPharmacyReviews error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ADMIN gets all reviews across all pharmacies.
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await RatingReview.find()
      .populate("userId", "name email")
      .populate("pharmacyId", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ reviews, totalCount: reviews.length });
  } catch (error) {
    console.error("getAllReviews error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// User can delete their own review. Admin can delete any.
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;
    const userRoles = Array.isArray(req.user.roles) ? req.user.roles : [req.user.roles];
    const isAdmin = userRoles.some(r => r.toLowerCase() === "admin");

    const review = await RatingReview.findById(reviewId);
    if (!review) return res.status(404).json({ message: "Review not found." });

    if (!isAdmin && review.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You can only delete your own reviews." });
    }

    await review.deleteOne();
    return res.status(200).json({ message: "Review deleted successfully." });
  } catch (error) {
    console.error("deleteReview error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};