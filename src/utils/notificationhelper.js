import Notification from "../models/notification.js";
import { getIO }    from "./socket.js"; 

export const createNotification = async ({
  recipientId,
  recipientRole,
  type,
  title,
  message,
  orderId = null,
  productId = null,
}) => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      recipientRole,
      type,
      title,
      message,
      orderId,
      productId,
    });

    const room = `user:${recipientId.toString()}`;
    getIO().to(room).emit("newNotification", {
      _id: notification._id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      orderId: notification.orderId,
      productId: notification.productId,
      isRead: false,
      
      createdAt: notification.createdAt,
    });

    return notification;
  } catch (err) { console.error("[Notification] createNotification failed:", err.message); }
};