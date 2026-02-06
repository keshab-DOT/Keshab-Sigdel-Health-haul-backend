import express from "express";
import { addToCart, getCartByUser, updateCartItem, removeCartItem, clearCart } from "../controllers/cartController.js";

const router = express.Router();

router.post("/", addToCart);
router.get("/user/:userId", getCartByUser);
router.put("/:id", updateCartItem);
router.delete("/:id", removeCartItem);
router.delete("/user/:userId", clearCart);

export default router;
