// khaltiController.js
// Place at: backend/controllers/khaltiController.js
//
// Requires in .env:
//   KHALTI_SECRET_KEY=your_key_here
//   FRONTEND_URL=http://localhost:5173

import axios from "axios";
import Order from "../models/order.js";

const KHALTI_INITIATE_URL = "https://a.khalti.com/api/v2/epayment/initiate/";
const KHALTI_LOOKUP_URL   = "https://a.khalti.com/api/v2/epayment/lookup/";

const headers = () => ({
  Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
  "Content-Type": "application/json",
});

// POST /api/payment/khalti/initiate
// Body: { orderId }
// Called right after the order is created with paymentMethod:"khalti"
export const initiateKhaltiPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ message: "orderId is required" });

    const order = await Order.findById(orderId)
      .populate("userId", "name email")
      .populate("products.productId", "productName productPrice");

    if (!order) return res.status(404).json({ message: "Order not found" });

    // Only the order owner can initiate payment
    if (String(order.userId._id) !== String(req.user._id))
      return res.status(403).json({ message: "Not your order" });

    if (order.paymentMethod !== "khalti")
      return res.status(400).json({ message: "Order payment method is not Khalti" });

    if (order.paymentStatus === "paid")
      return res.status(400).json({ message: "Order is already paid" });

    const amountPaisa   = Math.round(order.totalAmount * 100); // Khalti uses paisa
    const frontendUrl   = process.env.FRONTEND_URL || "http://localhost:5173";
    const returnUrl     = `${frontendUrl}/payment/result`;

    // Build product_details from order
    const productDetails = order.products.map(item => ({
      identity:    item.productId?._id?.toString() || item.productId.toString(),
      name:        item.productId?.productName || "Medicine",
      total_price: Math.round((item.productId?.productPrice || 0) * item.quantity * 100),
      quantity:    item.quantity,
      unit_price:  Math.round((item.productId?.productPrice || 0) * 100),
    }));

    const payload = {
      return_url:          returnUrl,
      website_url:         frontendUrl,
      amount:              amountPaisa,
      purchase_order_id:   orderId.toString(),
      purchase_order_name: `HealthHaul Order #${orderId.toString().slice(-6).toUpperCase()}`,
      customer_info: {
        name:  order.userId.name  || "Customer",
        email: order.userId.email || "",
        phone: order.phoneNumber  || "9800000000",
      },
      amount_breakdown: [
        { label: "Medicines", amount: amountPaisa },
      ],
      product_details: productDetails,
    };

    const { data } = await axios.post(KHALTI_INITIATE_URL, payload, { headers: headers() });

    // Save pidx on the order so we can verify later
    order.khaltiPidx = data.pidx;
    await order.save();

    return res.json({
      pidx:        data.pidx,
      payment_url: data.payment_url,
      totalAmount: order.totalAmount,
    });
  } catch (err) {
    console.error("Khalti initiate error:", err?.response?.data || err.message);
    return res.status(500).json({
      message: err?.response?.data?.detail || err.message || "Failed to initiate Khalti payment",
    });
  }
};

// POST /api/payment/khalti/verify
// Body: { pidx }
// Called from the frontend /payment/result page after Khalti redirect
export const verifyKhaltiPayment = async (req, res) => {
  try {
    const { pidx } = req.body;
    if (!pidx) return res.status(400).json({ message: "pidx is required" });

    // Lookup with Khalti
    const { data: khaltiData } = await axios.post(
      KHALTI_LOOKUP_URL,
      { pidx },
      { headers: headers() }
    );

    // Find the order by pidx
    const order = await Order.findOne({ khaltiPidx: pidx })
      .populate("products.productId", "productName productPrice productImageUrl");

    if (!order) return res.status(404).json({ message: "Order not found for this payment" });

    if (khaltiData.status === "Completed") {
      order.paymentStatus         = "paid";
      order.khaltiTransactionId   = khaltiData.transaction_id;
      order.orderStatus           = "pending"; // keep as pending until pharmacy confirms
      await order.save();

      return res.json({
        status:  "Completed",
        order,
        transactionId: khaltiData.transaction_id,
      });
    }

    // Payment not completed yet
    return res.json({ status: khaltiData.status, order });
  } catch (err) {
    console.error("Khalti verify error:", err?.response?.data || err.message);
    return res.status(500).json({
      message: err?.response?.data?.detail || err.message || "Failed to verify payment",
    });
  }
};