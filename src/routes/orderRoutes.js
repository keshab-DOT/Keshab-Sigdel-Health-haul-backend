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

router.post("/create/order", auth(), roleBasedAuth([PHARMACY]), createOrder);
router.post("/checkout/cart",  auth(), roleBasedAuth([USER]), checkoutCart);
router.get("/get/orders", auth(), roleBasedAuth([PHARMACY, USER, ADMIN]), getOrders);
router.get("/get/order/:id", auth(), roleBasedAuth([PHARMACY, USER, ADMIN]), getOrderById);
router.put("/update/order/:id", auth(), roleBasedAuth([PHARMACY, ADMIN]), updateOrderStatus);
router.delete("/delete/order/:id", auth(), roleBasedAuth([ADMIN, PHARMACY]), deleteOrder);

export default router;