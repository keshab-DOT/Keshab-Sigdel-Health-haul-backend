import express from "express";
import {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart
} from "../controllers/cartController.js";
import { ADMIN } from "../constants/roles.js";
import roleBasedAuth from "../middleware/rolebased.js";


const router = express.Router();

router.post("/add", addToCart);
router.get("/getcart", getCart);
router.put("/update/cartitem/:id", updateCartItem);
router.delete("/remove/cartitem/:id", removeCartItem);
router.delete("/clear/cart", clearCart);

export default router;
