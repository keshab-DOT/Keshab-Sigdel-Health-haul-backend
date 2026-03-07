import Product from "../models/product.js";

// Create product (pharmacy only)
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
      userId, // ✅ tied to the logged-in pharmacy
    });

    res.status(201).json({ message: "Product created successfully", product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get approved products (public - everyone sees all approved)
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

// Get MY products (pharmacy sees only their own)
export const getMyProducts = async (req, res) => {
  try {
    const userId = req.user._id;

    const products = await Product.find({ userId })
      .sort({ createdAt: -1 });

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
export const updateProduct = async (req, res) => {
  try {
    const userId = req.user._id;
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    // ✅ only owner can update
    if (product.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Forbidden: Not your product" });
    }

    const { productName, productDescription, productPrice, productTotalStockQuantity } = req.body;
    if (productName) product.productName = productName;
    if (productDescription) product.productDescription = productDescription;
    if (productPrice) product.productPrice = productPrice;
    if (productTotalStockQuantity) product.productTotalStockQuantity = productTotalStockQuantity;
    if (req.file) product.productImageUrl = req.file.filename;

    await product.save();
    res.status(200).json({ message: "Product updated successfully", product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete product (only owner pharmacy or admin)
export const deleteProduct = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRoles = req.user.roles;
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    // ✅ only owner or admin can delete
    const isAdmin = userRoles.includes("ADMIN");
    const isOwner = product.userId.toString() === userId.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: "Forbidden: Not your product" });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};