import Order from "../models/orderModel.js";
import RatingReview from "../models/ratingReviewModel.js";

export const createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user.id;
    console.log("UserId:", userId);

    const existingReview = await RatingReview.findOne({ userId, productId });
    if (existingReview) {
      return res.status(400).json({ message: "You already reviewed this product." });
    } 
    const deliveredOrder = await Order.findOne({
      userId,
      orderStatus: "delivered",
      "products.productId": productId,
    });

    if (!deliveredOrder) {
      return res.status(403).json({
        message: "You can only review products from delivered orders.",
      });
    }

    const review = await RatingReview.create({
      userId,
      productId,
      rating,
      comment,
    });

    return res.status(201).json({
      message: "Successfully gave the review and rating",
      data: review,
    });
  } catch (error) {
    console.error("Error creating review:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};