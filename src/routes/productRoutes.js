import express from "express";
import multer from "multer";
import path from "path";
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

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) cb(null, true);
  else cb(new Error("Only image files (jpeg, jpg, png, webp) are allowed"));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

router.get("/get/products", getApprovedProducts);
router.get("/get/product/by/:id", getProductById);
router.get("/my/products", auth(), roleBasedAuth([PHARMACY]), getMyProducts);
router.post("/create/product", auth(), roleBasedAuth([PHARMACY]), upload.single("image"), createProduct);
router.put("/product/update/:id", auth(), roleBasedAuth([PHARMACY]), upload.single("image"), updateProduct);
router.delete("/product/delete/:id", auth(), roleBasedAuth([ADMIN, PHARMACY]), deleteProduct);

export default router;