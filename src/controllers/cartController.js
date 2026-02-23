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

    quantity = Number(quantity) || 1;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid productId" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let existingItem = await Cart.findOne({ userId, productId });

    let currentQuantityInCart = existingItem ? existingItem.quantity : 0;

    if (
      currentQuantityInCart + quantity >
      product.productTotalStockQuantity
    ) {
      return res.status(400).json({
        message: `Only ${
          product.productTotalStockQuantity - currentQuantityInCart
        } left in stock`
      });
    }

    if (existingItem) {
      existingItem.quantity += quantity;
      await existingItem.save();

      return res.json({
        message: "Cart updated",
        cartItem: existingItem
      });
    }

    const newItem = await Cart.create({
      userId,
      productId,
      quantity
    });

    res.json({
      message: "Added to cart",
      cartItem: newItem
    });

  } catch (error) {
    console.log("Add to cart error:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET CART
export const getCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const cartItems = await Cart.find({ userId })
      .populate(
        "productId",
        "productName productPrice productImageUrl productTotalStockQuantity"
      );

    res.json(cartItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE CART ITEM
export const updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid cart item id" });
    }

    const cartItem = await Cart.findById(id);
    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    const product = await Product.findById(cartItem.productId);

    if (quantity > product.productTotalStockQuantity) {
      return res.status(400).json({
        message: `Only ${product.productTotalStockQuantity} in stock`
      });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    res.json({
      message: "Cart item updated",
      cartItem
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// REMOVE CART ITEM
export const removeCartItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid cart item id" });
    }

    const deleted = await Cart.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    res.json({ message: "Item removed from cart" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CLEAR CART
export const clearCart = async (req, res) => {
  try {
    const userId = req.user._id;

    await Cart.deleteMany({ userId });

    res.json({ message: "Cart cleared" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};