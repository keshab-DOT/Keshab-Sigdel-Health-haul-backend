import axios from "axios";
import Order from "../models/order.js";

const KHALTI_INITIATE_URL = "https://dev.khalti.com/api/v2/epayment/initiate/";
const KHALTI_LOOKUP_URL   = "https://dev.khalti.com/api/v2/epayment/lookup/";

const headers = () => ({
  Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
  "Content-Type": "application/json",
});

// POST /api/payment/khalti/initiate — Body: { orderId }
export const initiateKhaltiPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId)
      return res.status(400).json({ message: "orderId is required" });

    if (!process.env.KHALTI_SECRET_KEY)
      return res.status(500).json({ message: "KHALTI_SECRET_KEY not set in .env" });

    const order = await Order.findById(orderId)
      .populate("userId", "name email")
      .populate("products.productId", "productName productPrice");

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    if (!order.userId?._id)
      return res.status(500).json({ message: "Order user data missing" });

    if (String(order.userId._id) !== String(req.user._id))
      return res.status(403).json({ message: "Not your order" });

    if (order.paymentMethod !== "khalti")
      return res.status(400).json({ message: "Order payment method is not Khalti" });

    if (order.paymentStatus === "paid")
      return res.status(400).json({ message: "Order is already paid" });

    const amountPaisa = Math.round(order.totalAmount * 100);

    if (amountPaisa < 1000)
      return res.status(400).json({ message: "Minimum order amount for Khalti is Rs. 10" });

    const frontendUrl = process.env.FRONTEND_URL || "https://healthhaul.netlify.app";
    const returnUrl   = `${frontendUrl}/payment/result`;

    const productDetails = order.products.map((item) => {
      const price     = Number(item.productId?.productPrice) || 0;
      const qty       = Number(item.quantity) || 1;
      const unitPaisa = Math.round(price * 100);
      return {
        identity:    item.productId?._id?.toString() || "unknown",
        name:        item.productId?.productName || "Medicine",
        total_price: unitPaisa * qty,
        quantity:    qty,
        unit_price:  unitPaisa,
      };
    });

    const payload = {
      return_url:          returnUrl,
      website_url:         frontendUrl,
      amount:              amountPaisa,
      purchase_order_id:   orderId.toString(),
      purchase_order_name: `HealthHaul Order #${orderId.toString().slice(-6).toUpperCase()}`,
      customer_info: {
        name:  order.userId?.name  || "Customer",
        email: order.userId?.email || "customer@healthhaul.com",
        phone: order.phoneNumber   || "9800000000",
      },
      product_details: productDetails,
    };

    const { data } = await axios.post(KHALTI_INITIATE_URL, payload, { headers: headers() });

    order.khaltiPidx    = data.pidx;
    order.paymentStatus = "pending";
    await order.save();

    return res.json({
      pidx:        data.pidx,
      payment_url: data.payment_url,
      totalAmount: order.totalAmount,
    });
  } catch (err) {
    console.error("❌ Khalti initiate error:");
    console.error("  HTTP Status :", err?.response?.status);
    console.error("  Khalti Body :", JSON.stringify(err?.response?.data, null, 2));
    console.error("  Local msg   :", err.message);

    return res.status(500).json({
      message: err?.response?.data?.detail
             || err?.response?.data?.message
             || err.message
             || "Failed to initiate Khalti payment",
    });
  }
};

// POST /api/payment/khalti/verify — Body: { pidx }
export const verifyKhaltiPayment = async (req, res) => {
  try {
    const { pidx } = req.body;

    if (!pidx)
      return res.status(400).json({ message: "pidx is required" });

    const { data: khaltiData } = await axios.post(
      KHALTI_LOOKUP_URL,
      { pidx },
      { headers: headers() }
    );

    const order = await Order.findOne({ khaltiPidx: pidx }).populate(
      "products.productId",
      "productName productPrice productImageUrl"
    );

    if (!order)
      return res.status(404).json({ message: "Order not found for this payment" });

    if (khaltiData.status === "Completed") {
      order.paymentStatus       = "paid";
      order.khaltiTransactionId = khaltiData.transaction_id;
      order.orderStatus         = "pending";
      await order.save();
      return res.json({
        status:        "Completed",
        order,
        transactionId: khaltiData.transaction_id,
      });
    }

    if (["Expired", "User canceled", "Refunded"].includes(khaltiData.status)) {
      order.orderStatus   = "cancelled";
      order.paymentStatus = "unpaid";
      await order.save();
    }

    return res.json({ status: khaltiData.status, order });
  } catch (err) {
    console.error("❌ Khalti verify error:");
    console.error("  HTTP Status :", err?.response?.status);
    console.error("  Khalti Body :", JSON.stringify(err?.response?.data, null, 2));
    console.error("  Local msg   :", err.message);

    return res.status(500).json({
      message: err?.response?.data?.detail
             || err.message
             || "Failed to verify payment",
    });
  }
};