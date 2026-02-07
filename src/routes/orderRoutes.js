import express from "express";
import {
  createOrder,
  checkoutCart,
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder
} from "../controllers/orderController.js";

const router = express.Router();

// Create order manually (without userId)
router.post("/create/order", createOrder);

// Checkout cart → create order
router.post("/checkout/cart", checkoutCart);

// Get all orders
router.get("/get/orders", getOrders);

// Get order by ID
router.get("/get/order/:id", getOrderById);

// Update order status
router.put("/update/order/:id", updateOrderStatus);

// Delete order
router.delete("/delete/order/:id", deleteOrder);

export default router;
