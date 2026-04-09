import { createNotification } from "../utils/notificationhelper.js";

export const updateProductApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { approvalStatus } = req.body;

    if (!["Approved", "Rejected"].includes(approvalStatus))
      return res.status(400).json({ message: "Invalid approval status" });

    const product = await (await import("../models/product.js")).default.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.approvalStatus = approvalStatus;
    await product.save();

    await createNotification({
      recipientId:   product.userId,
      recipientRole: "PHARMACY",
      type: approvalStatus === "Approved" ? "PRODUCT_APPROVED" : "PRODUCT_REJECTED",
      title: approvalStatus === "Approved" ? "✅ Product Approved" : "❌ Product Rejected",
      message: approvalStatus === "Approved"
        ? `Your product "${product.productName}" has been approved and is now available on the page.`
        : `Your product "${product.productName}" was rejected by admin. Please review and resubmit.`,
      productId: product._id,
    });

    res.status(200).json({
      message: `Product ${approvalStatus.toLowerCase()} successfully`,
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};