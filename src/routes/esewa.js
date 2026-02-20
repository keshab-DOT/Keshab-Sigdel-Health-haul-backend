// import express from "express";
// import axios from "axios";
// import Order from "../models/order.js";

// const router = express.Router();

// // Verify eSewa payment
// router.post("/verify/esewa", async (req, res) => {
//   try {
//     const { tAmt, amt, txAmt, psc, pdc, scd, pid, refId } = req.body;

//     // Make request to eSewa verification API
//     const esewaUrl = `https://uat.esewa.com.np/epay/transrec`;
    
//     const params = new URLSearchParams();
//     params.append("amt", amt);
//     params.append("pdc", pdc);
//     params.append("psc", psc);
//     params.append("txAmt", txAmt);
//     params.append("tAmt", tAmt);
//     params.append("scd", scd);
//     params.append("pid", pid);
//     params.append("rid", refId);

//     const response = await axios.post(esewaUrl, params, {
//       headers: { "Content-Type": "application/x-www-form-urlencoded" }
//     });

//     // eSewa returns XML, check for SUCCESS
//     if (response.data.includes("Success")) {
//       // Payment verified
//       const order = await Order.findOneAndUpdate(
//         { _id: pid },
//         { orderStatus: "ontheway", paymentMethod: "esewa" },
//         { new: true }
//       );

//       return res.status(200).json({ message: "Payment verified successfully", order });
//     }

//     res.status(400).json({ message: "Payment verification failed" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error during eSewa verification" });
//   }
// });

// export default router;
