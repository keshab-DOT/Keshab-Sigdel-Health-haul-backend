import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, required: true }
    },
  ],
  shippingAddress: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ["cod", "khalti", "esewa"], default: "cod" },
  orderStatus: { type: String, enum: ["pending", "ontheway", "delivered", "cancalled"], default: "pending" },
}, { timestamps: true });

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
export default Order;

