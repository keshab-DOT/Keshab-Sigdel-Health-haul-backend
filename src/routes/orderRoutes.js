import express from "express";
import {
  createOrder,
  checkoutCart,
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder
} from "../controllers/orderController.js";
import auth from "../middleware/authMiddleware.js";
import { ADMIN } from "../constants/roles.js";
import roleBasedAuth from "../middleware/rolebased.js";

const router = express.Router();

// Create order manually (without userId)
router.post("/create/order", auth(), roleBasedAuth(ADMIN), createOrder);

// Checkout cart → create order
router.post("/checkout/cart", checkoutCart);

// Get all orders
router.get("/get/orders", getOrders);

// Get order by ID
router.get("/get/order/:id", getOrderById);

// Update order status
router.put("/update/order/:id", auth(), roleBasedAuth(ADMIN), updateOrderStatus);

// Delete order
router.delete("/delete/order/:id", auth(), roleBasedAuth(ADMIN), deleteOrder);

export default router;