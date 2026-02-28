import mongoose from "mongoose";
import Cart from "../models/cart.js";
import Product from "../models/product.js";

// ADD TO CART
export const addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    let { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "productId is required" });
    }

    quantity = Number(quantity);

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        message: "Quantity must be greater than 0",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid productId" });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Only approved products
    if (product.approvalStatus !== "Approved") {
      return res.status(400).json({
        message: "Product is not available for purchase",
      });
    }

    // Out of stock check
    if (product.productTotalStockQuantity <= 0) {
      return res.status(400).json({
        message: "Stock is insufficient. Product out of stock.",
      });
    }

    let existingItem = await Cart.findOne({ userId, productId });
    let currentQuantityInCart = existingItem ? existingItem.quantity : 0;

    if (currentQuantityInCart + quantity > product.productTotalStockQuantity) {
      return res.status(400).json({
        message: `Only ${product.productTotalStockQuantity - currentQuantityInCart
          } item(s) left in stock`,
      });
    }

    if (existingItem) {
      existingItem.quantity += quantity;
      await existingItem.save();

      return res.status(200).json({
        message: "Cart updated successfully",
        cartItem: existingItem,
      });
    }

    const newItem = await Cart.create({
      userId,
      productId,
      quantity,
    });

    res.status(201).json({
      message: "Added to cart successfully",
      cartItem: newItem,
    });

  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ message: error.message });
  }
};


// GET USER CART
export const getCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const cartItems = await Cart.find({ userId }).populate(
      "productId",
      "productName productPrice productImageUrl productTotalStockQuantity stockStatus approvalStatus"
    );

    res.status(200).json(cartItems);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE CART ITEM
export const updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    let { quantity } = req.body;

    quantity = Number(quantity);

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        message: "Quantity must be greater than 0",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid cart item id" });
    }

    const cartItem = await Cart.findById(id);

    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    // Ensure user owns this cart item
    if (cartItem.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Unauthorized access",
      });
    }

    const product = await Product.findById(cartItem.productId);

    if (!product) {
      return res.status(404).json({
        message: "Product no longer exists",
      });
    }

    if (product.approvalStatus !== "Approved") {
      return res.status(400).json({
        message: "Product is not available",
      });
    }

    if (product.productTotalStockQuantity <= 0) {
      return res.status(400).json({
        message: "Stock sakiyo. Product out of stock.",
      });
    }

    if (quantity > product.productTotalStockQuantity) {
      return res.status(400).json({
        message: `Only ${product.productTotalStockQuantity} item(s) available`,
      });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    res.status(200).json({
      message: "Cart item updated successfully",
      cartItem,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//REMOVE CART ITEM
export const removeCartItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid cart item id" });
    }

    const cartItem = await Cart.findById(id);

    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    if (cartItem.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Unauthorized access",
      });
    }

    await Cart.findByIdAndDelete(id);

    res.status(200).json({
      message: "Item removed from cart successfully",
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CLEAR CART
export const clearCart = async (req, res) => {
  try {
    const userId = req.user._id;

    await Cart.deleteMany({ userId });

    res.status(200).json({
      message: "Cart cleared successfully",
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};