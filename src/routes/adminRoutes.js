import express from "express";
import auth from "../middleware/authMiddleware.js";
import roleBasedAuth from "../middleware/rolebased.js";
import { ADMIN } from "../constants/roles.js";

import {
  getAllUsers,
  updateUserStatus,
  getAllProducts,
  updateProductApproval,
  adminDeleteProduct
} from "../controllers/adminController.js";

const router = express.Router();

// User management
router.get("/users", auth(), roleBasedAuth(ADMIN), getAllUsers);
router.put("/user/:id/status", auth(), roleBasedAuth(ADMIN), updateUserStatus);

// Product management
router.get("/products", auth(), roleBasedAuth(ADMIN), getAllProducts);
router.put("/product/:id/approval", auth(), roleBasedAuth(ADMIN), updateProductApproval);
router.delete("/product/:id", auth(), roleBasedAuth(ADMIN), adminDeleteProduct);

export default router;