// import express from "express";
// import axios from "axios";
// import Order from "../models/order.js";

// const router = express.Router();

// router.post("/verify/esewa", async (req, res) => {
//   try {
//     const { tAmt, amt, txAmt, psc, pdc, pid, refId } = req.body;

//     // Find order first
//     const order = await Order.findById(pid);

//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     // Verify amount matches database
//     if (Number(order.totalAmount) !== Number(tAmt)) {
//       return res.status(400).json({ message: "Amount mismatch" });
//     }

//     // Prepare verification request
//     const esewaUrl = "https://uat.esewa.com.np/epay/transrec";

//     const params = new URLSearchParams();
//     params.append("amt", amt);
//     params.append("pdc", pdc);
//     params.append("psc", psc);
//     params.append("txAmt", txAmt);
//     params.append("tAmt", tAmt);
//     params.append("scd", process.env.ESEWA_MERCHANT_ID); // ✅ secure
//     params.append("pid", pid);
//     params.append("rid", refId);

//     const response = await axios.post(esewaUrl, params, {
//       headers: { "Content-Type": "application/x-www-form-urlencoded" },
//     });

//     if (response.data.includes("Success")) {

//       // Update order safely
//       order.paymentStatus = "Paid";
//       order.paymentMethod = "eSewa";
//       order.transactionId = refId;
//       order.orderStatus = "ontheway";

//       await order.save();

//       return res.status(200).json({
//         message: "Payment verified successfully",
//         order,
//       });
//     }

//     return res.status(400).json({ message: "Payment verification failed" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error during eSewa verification" });
//   }
// });

// export default router;