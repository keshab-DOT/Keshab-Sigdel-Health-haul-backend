import express from "express";
import { createOrder, getOrders, getOrderById, getOrdersByUser, updateOrderStatus, deleteOrder, checkoutCart } from "../controllers/orderController.js";

const router = express.Router();

router.post("/", createOrder);
router.post("/checkout", checkoutCart);
router.get("/", getOrders);
router.get("/:id", getOrderById);
router.get("/user/:userId", getOrdersByUser);
router.put("/:id", updateOrderStatus);
router.delete("/:id", deleteOrder);

export default router;
