import mongoose from "mongoose";
import Product from "../models/product.js";

// CREATE PRODUCT (Pharmacy)
export const createProduct = async (req, res) => {
  try {
    const userId = req.user._id;

    const {
      productName,
      productDescription,
      productPrice,
      productImageUrl,
      productTotalStockQuantity,
    } = req.body;

    if (
      !productName ||
      !productDescription ||
      !productPrice ||
      productTotalStockQuantity === undefined
    ) {
      return res.status(400).json({
        message: "All fields including stock quantity are required",
      });
    }

    const stockStatus =
      productTotalStockQuantity > 0 ? "In Stock" : "Out of Stock";

    const product = await Product.create({
      productName,
      productDescription,
      productPrice,
      productImageUrl,
      productTotalStockQuantity,
      stockStatus,
      approvalStatus: "Pending",
      userId,
    });

    res.status(201).json({
      message: "Product submitted for admin approval",
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET APPROVED PRODUCTS (Public)
export const getApprovedProducts = async (_req, res) => {
  try {
    const products = await Product.find({
      approvalStatus: "Approved",
    })
      .populate("userId", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET MY PRODUCTS (Pharmacy - all statuses: Pending, Approved, Rejected)
export const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ userId: req.user._id })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET SINGLE PRODUCT (Public - Approved only)
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      approvalStatus: "Approved",
    }).populate("userId", "name email role");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE PRODUCT (Owner or Admin)
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (
      req.user.role !== "admin" &&
      product.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Not allowed to update this product",
      });
    }

    if (req.body.productTotalStockQuantity !== undefined) {
      req.body.stockStatus =
        req.body.productTotalStockQuantity > 0
          ? "In Stock"
          : "Out of Stock";
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        approvalStatus: "Pending", // re-approval required
      },
      { new: true }
    );

    res.status(200).json({
      message: "Product updated and sent for re-approval",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE PRODUCT (Owner or Admin)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (
      req.user.role !== "admin" &&
      product.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Not allowed to delete this product",
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADMIN: GET ALL PRODUCTS
export const getAllProductsAdmin = async (_req, res) => {
  try {
    const products = await Product.find()
      .populate("userId", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADMIN: APPROVE / REJECT PRODUCT
export const updateProductApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { approvalStatus } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    if (!["Approved", "Rejected"].includes(approvalStatus)) {
      return res.status(400).json({ message: "Invalid approval status" });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.approvalStatus = approvalStatus;
    await product.save();

    res.status(200).json({
      message: `Product ${approvalStatus} successfully`,
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};