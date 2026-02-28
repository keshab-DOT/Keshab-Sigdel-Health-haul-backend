import express from "express";
import {
  createProduct,
  getApprovedProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getMyProducts,
} from "../controllers/productController.js";
import auth from "../middleware/authMiddleware.js";
import { ADMIN, PHARMACY } from "../constants/roles.js";
import roleBasedAuth from "../middleware/rolebased.js";
import {multer, storage} from "../middleware/multerMiddleware.js";

const upload=multer({storage : storage});
const router = express.Router();

// anyone can see products
router.get("/get/products", getApprovedProducts);
router.get("/get/product/by/:id", getProductById);

// Pharmacy — see their own products (all statuses: Pending, Approved, Rejected)
router.get("/my/products", auth(), roleBasedAuth([PHARMACY]), getMyProducts);

// only pharmacy can create product
router.post("/create/product", auth(), roleBasedAuth([PHARMACY]), upload.single("image"), createProduct);

// update/delete:owner
router.put("/product/update/:id", auth(), roleBasedAuth([PHARMACY]), updateProduct);
router.delete("/product/delete/:id", auth(), roleBasedAuth([ADMIN, PHARMACY]), deleteProduct);

export default router;