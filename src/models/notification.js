import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  recipientRole: {
    type: String,
    enum: ["USER", "PHARMACY", "ADMIN"],
    required: true,
  },
  type: {
    type: String,
    enum: [
      "ORDER_PLACED", // → pharmacy: new order received
      "ORDER_STATUS", // → user: order status changed
      "PRODUCT_APPROVED", // → pharmacy: product approved by admin
      "PRODUCT_REJECTED", // → pharmacy: product rejected by admin
      "PAYMENT_RECEIVED", // → pharmacy: khalti payment confirmed
      "PAYMENT_SUCCESS", // → user: khalti payment confirmed
    ],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },

  // Optional references for deep linking
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },

  isRead: { type: Boolean, default: false },
  createdAt: { type: Date,    default: Date.now },
});

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

const Notification = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);

export default Notification;