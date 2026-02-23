import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import auth from "../middleware/authMiddleware.js";
import { ADMIN, PHARMACY } from "../constants/roles.js";
import roleBasedAuth from "../middleware/rolebased.js";
import {multer, storage} from "../middleware/multerMiddleware.js";

const upload=multer({storage : storage});
const router = express.Router();

// anyone can see products
router.get("/get/products", getProducts);
router.get("/get/product/by/:id", getProductById);

// only admin or logged-in users can create product
router.post("/create/product", auth(), roleBasedAuth([ADMIN, PHARMACY]), createProduct);

// update/delete: only admin or owner
router.put("/product/update/:id", auth(), roleBasedAuth([ADMIN, PHARMACY]), updateProduct);
router.delete("/product/delete/:id", auth(), roleBasedAuth([ADMIN]), deleteProduct);

export default router;