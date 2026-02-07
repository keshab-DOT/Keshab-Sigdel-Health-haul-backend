import Product from "../models/product.js";

/* CREATE PRODUCT */
export const createProduct = async (req, res) => {
  try {
    const userId = req.user._id;

    const {
      productName,
      productDescription,
      productPrice,
      productImageUrl,
      productTotalStockQuantity
    } = req.body;

    // validation
    if (
      !productName ||
      !productDescription ||
      !productPrice ||
      productTotalStockQuantity === undefined
    ) {
      return res.status(400).json({
        message: "Product name, description, price, and total stock quantity are required"
      });
    }

    const product = await Product.create({
      productName,
      productDescription,
      productPrice,
      productImageUrl,
      productTotalStockQuantity,
      userId
    });

    res.status(201).json({
      message: "Product created successfully",
      product
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* GET ALL PRODUCTS */
export const getProducts = async (_req, res) => {
  try {
    const products = await Product.find()
      .populate("userId", "name email role")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* GET PRODUCT BY ID */
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("userId", "name email role");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* UPDATE PRODUCT */
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // admin or owner only
    if (
      req.user.role !== "admin" &&
      product.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Forbidden. Not allowed to update this product."
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      message: "Product updated successfully",
      product: updatedProduct
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* DELETE PRODUCT */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // admin or owner only
    if (
      req.user.role !== "admin" &&
      product.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Forbidden. Not allowed to delete this product."
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: "Product deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
