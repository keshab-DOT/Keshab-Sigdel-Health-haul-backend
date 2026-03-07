import express from "express";
import {
  createProduct,
  getApprovedProducts,
  getMyProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import auth from "../middleware/authMiddleware.js";
import { ADMIN, PHARMACY } from "../constants/roles.js";
import roleBasedAuth from "../middleware/rolebased.js";
import { multer, storage } from "../middleware/multerMiddleware.js";

const upload = multer({ storage });
const router = express.Router();

// Public - anyone can see approved products
router.get("/get/products", getApprovedProducts);
router.get("/get/product/by/:id", getProductById);

// ✅ Pharmacy sees only THEIR OWN products
router.get("/my/products", auth(), roleBasedAuth([PHARMACY]), getMyProducts);

// Pharmacy creates product
router.post("/create/product", auth(), roleBasedAuth([PHARMACY]), upload.single("image"), createProduct);

// Only owner can update, owner or admin can delete
router.put("/product/update/:id", auth(), roleBasedAuth([PHARMACY]), updateProduct);
router.delete("/product/delete/:id", auth(), roleBasedAuth([ADMIN, PHARMACY]), deleteProduct);

export default router;