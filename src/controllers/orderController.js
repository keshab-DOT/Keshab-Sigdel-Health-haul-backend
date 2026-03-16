import Order   from "../models/order.js";
import Cart    from "../models/cart.js";
import Product from "../models/product.js";
import { createNotification } from "../utils/notificationhelper.js";

// CREATE ORDER (manual)
export const createOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { products, shippingAddress, phoneNumber, paymentMethod } = req.body;

    if (!products || !products.length) {
      return res.status(400).json({ message: "Products are required" });
    }

    let totalAmount = 0;
    const validatedProducts = [];

    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ message: "Product not found" });
      validatedProducts.push({ productId: product._id, quantity: item.quantity });
      totalAmount += product.productPrice * item.quantity;
    }

    const order = await Order.create({
      userId, products: validatedProducts,
      shippingAddress, phoneNumber, totalAmount, paymentMethod,
    });

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CHECKOUT CART
export const checkoutCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { shippingAddress, phoneNumber, paymentMethod } = req.body;
    const cartItems = await Cart.find({ userId }).populate("productId");

    if (!cartItems.length)
      return res.status(400).json({ message: "Cart is empty" });

    let totalAmount = 0;
    const products      = [];
    const pharmacyIds   = new Set();

    for (const item of cartItems) {
      const product = item.productId;
      products.push({ productId: product._id, quantity: item.quantity });
      totalAmount += product.productPrice * item.quantity;
      if (product.userId) pharmacyIds.add(product.userId.toString());
    }

    const order = await Order.create({
      userId, products, shippingAddress, phoneNumber, totalAmount, paymentMethod,
    });

    await Cart.deleteMany({ userId });

    // Notify user — order placed
    const methodLabel = paymentMethod === "khalti" ? "Khalti" : "Cash on Delivery";
    await createNotification({
      recipientId:   userId,
      recipientRole: "USER",
      type:          "ORDER_PLACED",
      title:         "✅ Order Placed Successfully",
      message:       `Your order of Rs. ${totalAmount.toLocaleString()} via ${methodLabel} has been placed and is pending.`,
      orderId:       order._id,
    });

    // Notify each pharmacy that has a product in this order
    for (const pharmacyId of pharmacyIds) {
      await createNotification({
        recipientId:   pharmacyId,
        recipientRole: "PHARMACY",
        type:          "ORDER_PLACED",
        title:         "📦 New Order Received",
        message:       `A new order worth Rs. ${totalAmount.toLocaleString()} has been placed. Please prepare it for delivery.`,
        orderId:       order._id,
      });
    }

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ORDERS
// ✅ USER → only their own orders
// ✅ PHARMACY → only orders containing their products
// ✅ ADMIN → all orders
export const getOrders = async (req, res) => {
  try {
    const userId    = req.user._id;
    const userRoles = Array.isArray(req.user.roles) ? req.user.roles : [req.user.roles];

    let orders;

    if (userRoles.includes("ADMIN")) {
      orders = await Order.find()
        .populate("userId", "name email")
        .populate({
          path:     "products.productId",
          select:   "productName productPrice productImageUrl productDescription userId",
          populate: { path: "userId", select: "name email" },
        })
        .sort({ createdAt: -1 });

    } else if (userRoles.includes("PHARMACY")) {
      const myProducts   = await Product.find({ userId }).select("_id");
      const myProductIds = myProducts.map(p => p._id.toString());

      const allOrders = await Order.find()
        .populate("userId", "name email")
        .populate({
          path:     "products.productId",
          select:   "productName productPrice productImageUrl productDescription userId",
          populate: { path: "userId", select: "name email" },
        })
        .sort({ createdAt: -1 });

      orders = allOrders.filter(order =>
        order.products.some(item =>
          item.productId && myProductIds.includes(item.productId._id.toString())
        )
      );

    } else {
      orders = await Order.find({ userId })
        .populate("userId", "name email")
        .populate({
          path:     "products.productId",
          select:   "productName productPrice productImageUrl productDescription userId",
          populate: { path: "userId", select: "name email" },
        })
        .sort({ createdAt: -1 });
    }

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ORDER BY ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("userId", "name email")
      .populate({
        path:     "products.productId",
        select:   "productName productPrice productImageUrl productDescription userId",
        populate: { path: "userId", select: "name email" },
      });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE ORDER STATUS (pharmacy/admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus },
      { new: true }
    ).populate("userId", "name email");

    if (!updatedOrder)
      return res.status(404).json({ message: "Order not found" });

    // Notify the customer about their order status change
    const statusTitles = {
      pending:   "⏳ Order Pending",
      delivered: "🎉 Order Delivered",
      cancelled: "❌ Order Cancelled",
    };
    const statusMessages = {
      pending: "Your order is pending confirmation.",
      ontheway: "Great news! Your order is on its way to you.",
      delivered: "Your order has been delivered. Enjoy your medicines!",
      cancelled: "Your order has been cancelled.",
    };

    if (updatedOrder.userId?._id) {
      await createNotification({
        recipientId: updatedOrder.userId._id,
        recipientRole: "USER",
        type: "ORDER_STATUS",
        title: statusTitles[orderStatus] || "Order Updated",
        message: statusMessages[orderStatus] || `Your order status is now: ${orderStatus}`,
        orderId: updatedOrder._id,
      });
    }

    res.json({ message: "Order status updated", order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE ORDER
export const deleteOrder = async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder)
      return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};