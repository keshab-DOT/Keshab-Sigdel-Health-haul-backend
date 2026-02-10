import axios from "axios";
import Payment from "../models/paymentModel.js";

export const verifyTransactions = async (req, res) => {
  try {
    const { pidx } = req.body;

    if (!pidx) {
      return res.status(400).json({ message: "pidx is required" });
    }

    const existingPayment = await Payment.findOne({ pidx });

    if (existingPayment && existingPayment.paymentStatus === 'paid') {
      return res.status(404).json({ message: "Payment already verified" });
    }

    const response = await axios.post(
      "https://a.khalti.com/api/v2/epayment/lookup/",
      { pidx },
      {
        headers: {
          Authorization: 'Key bd2b92f5a5f64b4b91089e2d1d1e08d9',
          "Content-Type": "application/json"
        }
      }
    );

    const { status } = response.data;

    if (status === "Completed") {
      await Payment.findOneAndUpdate({ pidx }, { paymentStatus: 'paid' });
      return res.status(200).json({ message: "Payment verified successfully" });
    }

    return res.status(400).json({ message: `Payment status is '${status}'` });

  } catch (error) {
    const status = error.response?.data?.status;
    if (status === "Expired") {
      return res.status(410).json({ message: "The pidx is expired" });
  
    }
    return res.status(500).json({ message: "Server error during payment verification" });
  }
};

