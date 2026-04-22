import Order from "../models/order.js";
import Cart from "../models/cart.js";
import Product from "../models/product.js";
import Payment from "../models/payment.js";
import { createNotification } from "../utils/notificationhelper.js";

const decrementStockAndNotify = async (products, orderId) => {
  const notifiedPharmacies = new Set();

  for (const item of products) {
    const product = await Product.findById(item.productId);
    if (!product) continue;

    const prevStock = product.productTotalStockQuantity;
    const newStock = Math.max(0, prevStock - item.quantity);

    product.productTotalStockQuantity = newStock;
    product.stockStatus = newStock === 0 ? "Out of Stock" : "In Stock";
    await product.save();

    const pharmacyId = product.userId?.toString();
    if (!pharmacyId) continue;

    if (!notifiedPharmacies.has(pharmacyId)) {
      notifiedPharmacies.add(pharmacyId);
      await createNotification({
        recipientId: product.userId,
        recipientRole: "PHARMACY",
        type: "ORDER_PLACED",
        title: "📦 New Order Received",
        message:
          "A new order has been placed containing your products. Please prepare it for delivery.",
        orderId,
      });
    }

    if (prevStock > 0 && newStock === 0) {
      await createNotification({
        recipientId: product.userId,
        recipientRole: "PHARMACY",
        type: "LOW_STOCK",
        title: "🚨 Out of Stock Alert",
        message: `Your product "${product.productName}" is now out of stock. Please restock to keep selling.`,
        productId: product._id,
      });
    }
  }
};

export const createOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { products, shippingAddress, phoneNumber, paymentMethod } = req.body;

    if (!products || !products.length)
      return res.status(400).json({ message: "Products are required" });

    let totalAmount = 0;
    const validatedProducts = [];

    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product)
        return res.status(404).json({ message: "Product not found" });
      validatedProducts.push({ productId: product._id, quantity: item.quantity });
      totalAmount += product.productPrice * item.quantity;
    }

    const order = await Order.create({
      userId,
      products: validatedProducts,
      shippingAddress,
      phoneNumber,
      totalAmount,
      paymentMethod,
    });

    await decrementStockAndNotify(validatedProducts, order._id);

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const checkoutCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { shippingAddress, phoneNumber, paymentMethod } = req.body;
    const cartItems = await Cart.find({ userId }).populate("productId");

    if (!cartItems.length)
      return res.status(400).json({ message: "Cart is empty" });

    let totalAmount = 0;
    const products = [];

    for (const item of cartItems) {
      const product = item.productId;
      products.push({ productId: product._id, quantity: item.quantity });
      totalAmount += product.productPrice * item.quantity;
    }

    const order = await Order.create({
      userId,
      products,
      shippingAddress,
      phoneNumber,
      totalAmount,
      paymentMethod,
    });

    await Cart.deleteMany({ userId });
    await decrementStockAndNotify(products, order._id);

    const methodLabel =
      paymentMethod === "khalti" ? "Khalti" : "Cash on Delivery";
    await createNotification({
      recipientId: userId,
      recipientRole: "USER",
      type: "ORDER_PLACED",
      title: "✅ Order Placed Successfully",
      message: `Your order of Rs. ${totalAmount.toLocaleString()} via ${methodLabel} has been placed and is pending.`,
      orderId: order._id,
    });

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRoles = Array.isArray(req.user.roles)
      ? req.user.roles
      : [req.user.roles];

    let orders;

    if (userRoles.includes("ADMIN")) {
      orders = await Order.find()
        .populate("userId", "name email")
        .populate({
          path: "products.productId",
          select:
            "productName productPrice productImageUrl productDescription productTotalStockQuantity stockStatus userId",
          populate: { path: "userId", select: "name email" },
        })
        .sort({ createdAt: -1 });
    } else if (userRoles.includes("PHARMACY")) {
      const myProducts = await Product.find({ userId }).select("_id");
      const myProductIds = myProducts.map((p) => p._id.toString());

      const allOrders = await Order.find()
        .populate("userId", "name email")
        .populate({
          path: "products.productId",
          select:
            "productName productPrice productImageUrl productDescription productTotalStockQuantity stockStatus userId",
          populate: { path: "userId", select: "name email" },
        })
        .sort({ createdAt: -1 });

      orders = allOrders.filter((order) =>
        order.products.some(
          (item) =>
            item.productId &&
            myProductIds.includes(item.productId._id.toString())
        )
      );
    } else {
      orders = await Order.find({ userId })
        .populate("userId", "name email")
        .populate({
          path: "products.productId",
          select:
            "productName productPrice productImageUrl productDescription productTotalStockQuantity stockStatus userId",
          populate: { path: "userId", select: "name email" },
        })
        .sort({ createdAt: -1 });
    }

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("userId", "name email")
      .populate({
        path: "products.productId",
        select:
          "productName productPrice productImageUrl productDescription productTotalStockQuantity stockStatus userId",
        populate: { path: "userId", select: "name email" },
      });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;

    const order = await Order.findById(req.params.id).populate(
      "userId",
      "name email"
    );

    if (!order) return res.status(404).json({ message: "Order not found" });

    order.orderStatus = orderStatus;

    // ── COD: mark as paid + create Payment record when delivered
    if (orderStatus === "delivered" && order.paymentMethod === "cod") {
      order.paymentStatus = "paid";

      try {
        await Payment.create({
          orderId: order._id,
          userId: order.userId?._id || order.userId,
          pidx: null,
          transactionId: null,
          amount: order.totalAmount,
          method: "cod",
          status: "completed",
        });
      } catch (paymentErr) {
        console.error("⚠️ COD Payment record save failed:", paymentErr.message);
      }
    }

    // ── If cancelled, mark as unpaid
    if (orderStatus === "cancelled") {
      order.paymentStatus = "unpaid";
    }

    await order.save();

    // ── Notify the customer
    const statusTitles = {
      pending: "⏳ Order Pending",
      delivered: "🎉 Order Delivered",
      cancelled: "❌ Order Cancelled",
    };
    const statusMessages = {
      pending: "Your order is pending confirmation.",
      delivered: "Your order has been delivered. Enjoy your medicines!",
      cancelled: "Your order has been cancelled.",
    };

    if (order.userId?._id) {
      await createNotification({
        recipientId: order.userId._id,
        recipientRole: "USER",
        type: "ORDER_STATUS",
        title: statusTitles[orderStatus] || "Order Updated",
        message:
          statusMessages[orderStatus] ||
          `Your order status is now: ${orderStatus}`,
        orderId: order._id,
      });
    }

    res.json({ message: "Order status updated", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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