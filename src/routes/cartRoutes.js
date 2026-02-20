import express from "express";
import {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart
} from "../controllers/cartController.js";
import auth from "../middleware/authMiddleware.js";
import { ADMIN, USER } from "../constants/roles.js";
import roleBasedAuth from "../middleware/rolebased.js";


const router = express.Router();

router.post("/add", auth(), roleBasedAuth(USER), addToCart);
router.get("/getcart", auth(), roleBasedAuth(USER), getCart);
router.put("/update/cartitem/:id", auth(), roleBasedAuth(USER), updateCartItem);
router.delete("/remove/cartitem/:id", auth(), roleBasedAuth(USER), removeCartItem);
router.delete("/clear/cart", auth(), roleBasedAuth(USER), clearCart);

export default router;
