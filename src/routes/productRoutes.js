import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

// anyone can see products
router.get("/get/products", getProducts);
router.get("/get/product/by/:id", getProductById);

// only admin or logged-in users can create product
router.post("/create/product", auth(), createProduct);

// update/delete: only admin or owner
router.put("/product/update/:id", auth(), updateProduct);
router.delete("/product/delete/:id", auth(), deleteProduct);

export default router;
