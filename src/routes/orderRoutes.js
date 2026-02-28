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
import { ADMIN, USER, PHARMACY } from "../constants/roles.js";
import roleBasedAuth from "../middleware/rolebased.js";

const router = express.Router();

// Create order manually (without userId)
router.post("/create/order", auth(), roleBasedAuth([PHARMACY]), createOrder);

// Checkout cart → create order
router.post("/checkout/cart",  auth(), roleBasedAuth([USER]), checkoutCart);

// Get all orders
router.get("/get/orders", auth(), roleBasedAuth([PHARMACY, USER, ADMIN]), getOrders);

// Get order by ID
router.get("/get/order/:id", auth(), roleBasedAuth([PHARMACY, USER, ADMIN]), getOrderById);

// Update order status
router.put("/update/order/:id", auth(), roleBasedAuth([PHARMACY, ADMIN]), updateOrderStatus);

// Delete order
router.delete("/delete/order/:id", auth(), roleBasedAuth([ADMIN, PHARMACY]), deleteOrder);

export default router;