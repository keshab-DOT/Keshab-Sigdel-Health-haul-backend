import mongoose from "mongoose";
import Product from "../models/product.js";
import User from "../models/userModel.js";
import { createNotification } from "../utils/notificationhelper.js";

// Get All Users (without password)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update User Status (Active / Suspended / Banned)
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid user ID" });

    if (!["Active", "Suspended", "Banned"].includes(status))
      return res.status(400).json({ message: "Invalid status" });

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user._id.toString() === req.user._id.toString())
      return res.status(400).json({ message: "Admin cannot modify their own status" });

    user.status = status;
    await user.save();

    res.status(200).json({ message: "User status updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Products (Admin View)
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("userId", "name email role")
      .sort({ createdAt: -1 });
    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve or Reject Product — notifies pharmacy
export const updateProductApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { approvalStatus } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid product ID" });

    if (!["Approved", "Rejected"].includes(approvalStatus))
      return res.status(400).json({ message: "Invalid approval status" });

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.approvalStatus = approvalStatus;
    await product.save();

    // Notify the pharmacy that owns this product
    await createNotification({
      recipientId: product.userId,
      recipientRole: "PHARMACY",
      type: approvalStatus === "Approved" ? "PRODUCT_APPROVED" : "PRODUCT_REJECTED",
      title: approvalStatus === "Approved" ? "✅ Product Approved" : "❌ Product Rejected",
      message: approvalStatus === "Approved"
        ? `Your product "${product.productName}" has been approved and is now live on the platform.`
        : `Your product "${product.productName}" was rejected by admin. Please review and resubmit.`,
      productId: product._id,
    });

    res.status(200).json({
      message: `Product ${approvalStatus.toLowerCase()} successfully`,
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Any Product (Admin Only)
export const adminDeleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid product ID" });

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    await Product.findByIdAndDelete(id);
    res.status(200).json({ message: "Product deleted successfully by admin" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};