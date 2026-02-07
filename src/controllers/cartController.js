import mongoose from "mongoose";
import Cart from "../models/cart.js";
import Product from "../models/Product.js";

// ADD TO CART
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid productId" });
    }

    // Check product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check stock availability
    let currentQuantityInCart = 0;
    const existingItem = await Cart.findOne({ productId });
    if (existingItem) currentQuantityInCart = existingItem.quantity;

    if (currentQuantityInCart + quantity > product.productTotalStockQuantity) {
      return res.status(400).json({
        message: `Cannot add ${quantity} items. Only ${
          product.productTotalStockQuantity - currentQuantityInCart
        } left in stock`
      });
    }

    // If product already in cart → update quantity
    if (existingItem) {
      existingItem.quantity += quantity;
      await existingItem.save();

      return res.status(200).json({
        message: "Product quantity updated in cart",
        cartItem: existingItem
      });
    }

    // If new product → add to cart
    const newItem = await Cart.create({
      productId,
      quantity
    });

    return res.status(201).json({
      message: "Product added to cart successfully",
      cartItem: newItem
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET CART
export const getCart = async (req, res) => {
  try {
    const cartItems = await Cart.find()
      .populate("productId", "productName productPrice productImageUrl productTotalStockQuantity");

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
    if (!cartItem) return res.status(404).json({ message: "Cart item not found" });

    const product = await Product.findById(cartItem.productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (quantity > product.productTotalStockQuantity) {
      return res.status(400).json({
        message: `Cannot update to ${quantity}. Only ${product.productTotalStockQuantity} in stock`
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
    if (!deleted) return res.status(404).json({ message: "Cart item not found" });

    res.json({ message: "Item removed from cart" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CLEAR CART
export const clearCart = async (req, res) => {
  try {
    await Cart.deleteMany();
    res.json({ message: "Cart cleared" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
