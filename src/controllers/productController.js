import Product from "../models/product.js";
import User from "../models/userModel.js";
import { createNotification } from "../utils/notificationhelper.js";

// Create product (pharmacy only) — notifies admins for approval
export const createProduct = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productName, productDescription, productPrice, productTotalStockQuantity } = req.body;

    const productImageUrl = req.file ? req.file.filename : "";

    const product = await Product.create({
      productName,
      productDescription,
      productPrice,
      productImageUrl,
      productTotalStockQuantity,
      userId,
    });

    // Notify all admins — new product needs approval
    const admins = await User.find({ roles: { $in: ["ADMIN"] } }).select("_id");
    for (const admin of admins) {
      await createNotification({
        recipientId: admin._id,
        recipientRole: "ADMIN",
        type: "PRODUCT_APPROVAL_NEEDED",
        title: "🆕 Product Needs Approval",
        message: `A pharmacy submitted "${productName}" for review. Please approve or reject it.`,
        productId: product._id,
      });
    }

    res.status(201).json({ message: "Product created successfully", product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get approved products (public)
export const getApprovedProducts = async (req, res) => {
  try {
    const products = await Product.find({ approvalStatus: "Approved" })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get MY products (pharmacy only)
export const getMyProducts = async (req, res) => {
  try {
    const userId = req.user._id;
    const products = await Product.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get product by ID (public)
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("userId", "name email");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update product (only owner pharmacy)
// ✅ Resets approvalStatus to Pending + notifies admins
export const updateProduct = async (req, res) => {
  try {
    const userId = req.user._id;
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.userId.toString() !== userId.toString())
      return res.status(403).json({ message: "Forbidden: Not your product" });

    const { productName, productDescription, productPrice, productTotalStockQuantity } = req.body;
    if (productName) product.productName = productName;
    if (productDescription) product.productDescription = productDescription;
    if (productPrice) product.productPrice = productPrice;
    if (productTotalStockQuantity) product.productTotalStockQuantity = productTotalStockQuantity;
    if (req.file) product.productImageUrl = req.file.filename;

    // Reset to Pending so admin must re-approve
    product.approvalStatus = "Pending";

    await product.save();

    // Notify all admins — updated product needs re-approval
    const admins = await User.find({ roles: { $in: ["ADMIN"] } }).select("_id");
    for (const admin of admins) {
      await createNotification({
        recipientId: admin._id,
        recipientRole: "ADMIN",
        type: "PRODUCT_APPROVAL_NEEDED",
        title: "✏️ Product Updated — Needs Re-Approval",
        message: `A pharmacy updated "${product.productName}" and it requires your review again.`,
        productId: product._id,
      });
    }

    res.status(200).json({ message: "Product updated successfully, pending re-approval", product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete product (owner pharmacy or admin)
export const deleteProduct = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRoles = req.user.roles;
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    const isAdmin = userRoles.includes("ADMIN");
    const isOwner = product.userId.toString() === userId.toString();

    if (!isAdmin && !isOwner)
      return res.status(403).json({ message: "Forbidden: Not your product" });

    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};