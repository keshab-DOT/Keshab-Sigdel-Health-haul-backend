import Order from "../models/order.js";
import Cart from "../models/cart.js";
import Product from "../models/product.js";

// CREATE ORDER
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

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (item.quantity > product.productTotalStockQuantity) {
        return res.status(400).json({
          message: `Only ${product.productTotalStockQuantity} left in stock`
        });
      }

      // Reduce stock
      await Product.findByIdAndUpdate(product._id, {
        $inc: { productTotalStockQuantity: -item.quantity }
      });

      validatedProducts.push({
        productId: product._id,
        quantity: item.quantity
      });

      totalAmount += product.productPrice * item.quantity;
    }

    const order = await Order.create({
      userId,
      products: validatedProducts,
      shippingAddress,
      phoneNumber,
      totalAmount,
      paymentMethod
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

    if (!cartItems.length) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let totalAmount = 0;
    const products = [];

    for (const item of cartItems) {
      const product = item.productId;

      if (item.quantity > product.productTotalStockQuantity) {
        return res.status(400).json({
          message: `Only ${product.productTotalStockQuantity} left in stock`
        });
      }

      await Product.findByIdAndUpdate(product._id, {
        $inc: { productTotalStockQuantity: -item.quantity }
      });

      products.push({
        productId: product._id,
        quantity: item.quantity
      });

      totalAmount += product.productPrice * item.quantity;
    }

    const order = await Order.create({
      userId,
      products,
      shippingAddress,
      phoneNumber,
      totalAmount,
      paymentMethod
    });

    await Cart.deleteMany({ userId });

    res.status(201).json({ message: "Order placed successfully", order });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL ORDERS
export const getOrders = async (_req, res) => {
  try {
    const orders = await Order.find()
      .populate("products.productId", "productName productPrice productImageUrl")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ORDER BY ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("products.productId", "productName productPrice productImageUrl");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE ORDER STATUS
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
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

    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};