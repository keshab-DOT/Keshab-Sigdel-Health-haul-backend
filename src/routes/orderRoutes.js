import express from "express";
import { createOrder, getOrders, getOrderById, getOrdersByUser, updateOrderStatus, deleteOrder, checkoutCart } from "../controllers/orderController.js";

const router = express.Router();

router.post("/create/order", createOrder);
router.post("/checkout/cart", checkoutCart);
router.get("/get/order", getOrders);
router.get("/get/order/by/:id", getOrderById);
router.get("/get/order/byuser/:id", getOrdersByUser);
router.put("/update/order/status/:id", updateOrderStatus);
router.delete("/delete/order/:id", deleteOrder);

export default router;
