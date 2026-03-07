router.get("/esewa/success", async (req, res) => {

  const { data } = req.query;

  const decoded = JSON.parse(
    Buffer.from(data, "base64").toString("utf8")
  );

  const { transaction_uuid, total_amount } = decoded;

  const statusCheckUrl = `https://rc.esewa.com.np/api/epay/transaction/status/?product_code=${process.env.ESEWA_PRODUCT_CODE}&total_amount=${total_amount}&transaction_uuid=${transaction_uuid}`;

  const response = await axios.get(statusCheckUrl);

  if (response.data.status === "COMPLETE") {

    // update order payment status

    res.send("Payment Successful");
  } else {

    res.send("Payment Verification Failed");
  }
});