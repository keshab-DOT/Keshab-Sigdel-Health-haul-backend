import Cart from "../models/cart.js";
import Product from "../models/product.js";

// Add to cart
export const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;
    let item = await Cart.findOne({ userId, productId });
    if (item) {
      item.quantity += quantity;
      await item.save();
      return res.json(item);
    }
    item = await Cart.create({ userId, productId, quantity });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's cart
export const getCartByUser = async (req, res) => {
  try {
    const cartItems = await Cart.find({ userId: req.params.userId })
      .populate("productId", "productName productPrice productImageUrl");
    res.json(cartItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update cart item
export const updateCartItem = async (req, res) => {
  try {
    const updated = await Cart.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Cart item not found" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove item
export const removeCartItem = async (req, res) => {
  try {
    const deleted = await Cart.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Cart item not found" });
    res.json({ message: "Item removed from cart" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Clear cart
export const clearCart = async (req, res) => {
  try {
    await Cart.deleteMany({ userId: req.params.userId });
    res.json({ message: "Cart cleared" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
