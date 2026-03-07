import express from "express";
import { generateEsewaSignature } from "../utils/esewaSignature.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

router.post("/esewa/initiate", async (req, res) => {

  const { amount } = req.body;

  const transaction_uuid = uuidv4();

  const tax_amount = 0;
  const product_service_charge = 0;
  const product_delivery_charge = 0;

  const total_amount =
    Number(amount) +
    tax_amount +
    product_service_charge +
    product_delivery_charge;

  const signature = generateEsewaSignature(
    total_amount,
    transaction_uuid,
    process.env.ESEWA_PRODUCT_CODE
  );

  res.json({
    amount,
    tax_amount,
    total_amount,
    transaction_uuid,
    product_code: process.env.ESEWA_PRODUCT_CODE,
    product_service_charge,
    product_delivery_charge,
    success_url: process.env.ESEWA_SUCCESS_URL,
    failure_url: process.env.ESEWA_FAILURE_URL,
    signed_field_names: "total_amount,transaction_uuid,product_code",
    signature,
  });
});

export default router;