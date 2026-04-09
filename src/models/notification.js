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
      "ORDER_PLACED", 
      "ORDER_STATUS",
      "PRODUCT_APPROVED", 
      "PRODUCT_REJECTED", 
      "PRODUCT_APPROVAL_NEEDED", 
      "PAYMENT_RECEIVED", 
      "PAYMENT_SUCCESS", 
      "LOW_STOCK", 
    ],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },

  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },

  isRead: { type: Boolean, default: false },
  createdAt: { type: Date,    default: Date.now },
});

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

const Notification = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);

export default Notification;