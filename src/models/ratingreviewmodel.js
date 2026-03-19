import mongoose from "mongoose";

const ratingReviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pharmacyId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true,},
    orderId: {type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true,},
    rating: {type: Number, required: true, min: 1, max: 5,},
    comment: {type: String,trim: true, maxlength: 500,default: "", },
  },
  { timestamps: true }
);

// One review per user per pharmacy
ratingReviewSchema.index({ userId: 1, pharmacyId: 1 }, { unique: true });

const RatingReview =
  mongoose.models.RatingReview ||
  mongoose.model("RatingReview", ratingReviewSchema);

export default RatingReview;