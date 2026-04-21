import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, required: true }
    },
  ],
  shippingAddress: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ["cod", "khalti"], default: "cod" },

  // Khalti 
  khaltiPidx: { type: String, default: "" },
  khaltiTransactionId: { type: String, default: "" },

  paymentStatus: {
    type: String,
    enum: ["unpaid", "pending", "paid"],
    default: "unpaid",
  },
  orderStatus: { type: String, enum: ["pending", "delivered", "cancelled"], default: "pending" },
}, { timestamps: true });

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
export default Order;