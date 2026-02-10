import Order from "../models/order.js";
import Cart from "../models/cart.js";
import Product from "../models/product.js"; 

// CREATE ORDER manually (without userId)
export const createOrder = async (req, res) => {
  try {
    const { products, shippingAddress, phoneNumber, paymentMethod } = req.body;

    if (!products || !products.length) {
      return res.status(400).json({ message: "Products are required" }); // at least one product
    }

    let totalAmount = 0;
    const validatedProducts = [];

    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.productId}` });
      }

      if (item.quantity > product.productTotalStockQuantity) {
        return res.status(400).json({
          message: `Cannot order ${item.quantity} of ${product.productName}. Only ${product.productTotalStockQuantity} in stock`
        });
      }

      validatedProducts.push({ productId: product._id, quantity: item.quantity });
      totalAmount += product.productPrice * item.quantity;
    }

    const order = await Order.create({
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

// CHECKOUT CART by creating order (without userId)
export const checkoutCart = async (req, res) => {
  try {
    const { shippingAddress, phoneNumber, paymentMethod } = req.body;

    const cartItems = await Cart.find().populate("productId", "productName productPrice productTotalStockQuantity");

    if (!cartItems.length) return res.status(400).json({ message: "Cart is empty" });

    let totalAmount = 0;
    const products = [];

    for (const item of cartItems) {
      const product = item.productId;

      if (item.quantity > product.productTotalStockQuantity) {
        return res.status(400).json({
          message: `Cannot order ${item.quantity} of ${product.productName}. Only ${product.productTotalStockQuantity} in stock`
        });
      }

      products.push({ productId: product._id, quantity: item.quantity });
      totalAmount += product.productPrice * item.quantity;
    }

    const order = await Order.create({ products, shippingAddress, phoneNumber, totalAmount, paymentMethod });

    await Cart.deleteMany(); // clear cart after checkout

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

    if (!order) return res.status(404).json({ message: "Order not found" });

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

    if (!updatedOrder) return res.status(404).json({ message: "Order not found" });

    res.json({ message: "Order status updated", order: updatedOrder });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE ORDER
export const deleteOrder = async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);

    if (!deletedOrder) return res.status(404).json({ message: "Order not found" });

    res.json({ message: "Order deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
