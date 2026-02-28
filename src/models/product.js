import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  productDescription: { type: String, required: true },
  productPrice: { type: Number, required: true },
  productImageUrl: { type: String },
  productTotalStockQuantity: { type: Number, required: true, min: 0 },
  stockStatus: {
    type: String,
    enum: ["In Stock", "Out of Stock"],
    default: "In Stock",
  },
  approvalStatus: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
export default Product;
