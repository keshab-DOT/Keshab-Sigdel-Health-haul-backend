import Order from "../models/order.js";
import Cart from "../models/cart.js";

// Create order manually
export const createOrder = async (req, res) => {
  try {
    const order = await Order.create(req.body);
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Checkout cart → create order
export const checkoutCart = async (req, res) => {
  try {
    const { userId, shippingAddress, phoneNumber, paymentMethod } = req.body;

    const cartItems = await Cart.find({ userId }).populate("productId", "productName productPrice");
    if (!cartItems.length) return res.status(400).json({ message: "Cart is empty" });

    let totalAmount = 0;
    const products = cartItems.map(item => {
      totalAmount += item.productId.productPrice * item.quantity;
      return { productId: item.productId._id, quantity: item.quantity };
    });

    const order = await Order.create({
      userId, products, shippingAddress, phoneNumber, totalAmount, paymentMethod
    });

    await Cart.deleteMany({ userId });

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all orders
export const getOrders = async (_req, res) => {
  try {
    const orders = await Order.find().populate("userId", "name email")
      .populate("products.productId", "productName productPrice productImageUrl")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get order by id
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("userId", "name email")
      .populate("products.productId", "productName productPrice productImageUrl");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get orders by user
export const getOrdersByUser = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId })
      .populate("products.productId", "productName productPrice productImageUrl")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const updated = await Order.findByIdAndUpdate(req.params.id, { orderStatus: req.body.orderStatus }, { new: true });
    if (!updated) return res.status(404).json({ message: "Order not found" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete order
export const deleteOrder = async (req, res) => {
  try {
    const deleted = await Order.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
