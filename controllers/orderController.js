import axios from "axios";
import Order from "../models/orderModel.js";
import Payment from "../models/paymentModel.js";
import Cart from '../models/cartModel.js'; 

export const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      products,
      shippingAddress,
      phoneNumber,
      totalAmount,
      paymentMethod,
      orderStatus
    } = req.body;

    console.log("ShippingAddress:", shippingAddress);

    // Check required fields
    if (
      !userId ||
      !products ||
      products.length === 0 ||
      !shippingAddress ||
      !phoneNumber ||
      !totalAmount ||
      !paymentMethod ||
      !orderStatus
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const orderData = await Order.create({
      userId,
      products,
      phoneNumber,
      totalAmount,
      paymentMethod,
      shippingAddress,
      orderStatus
    });

    const paymentData = await Payment.create({
      userId,
      paymentMethod,
      totalAmount,
      orderId: orderData._id,
      paymentStatus: "pending",
    });

    const orderedProductIds = products.map(p => p.productId);
    await Cart.deleteMany({
      userId,
      productId: { $in: orderedProductIds }
    });

    //  Handle Khalti Payment
    if (paymentMethod === 'khalti') {
      const khaltiPayload = {
        return_url: "http://localhost:5173/success/",
        website_url: "https://localhost:5173",
        amount: totalAmount * 100,
        purchase_order_id: orderData._id,
        purchase_order_name: "test",
      };

      const khaltiResponse = await axios.post(
        'https://dev.khalti.com/api/v2/epayment/initiate/',
        khaltiPayload,
        {
          headers: {
            Authorization: 'key bd2b92f5a5f64b4b91089e2d1d1e08d9',
          }
        }
      );

      paymentData.pidx = khaltiResponse.data.pidx;
      await paymentData.save();

      return res.status(200).json({
        message: "Order placed successfully, redirect to Khalti",
        url: khaltiResponse.data.payment_url,
        order: orderData
      });
    }

    if (paymentMethod === 'cod') {
      return res.status(200).json({
        message: "Order placed successfully with Cash on Delivery",
        order: orderData
      });
    }

  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({
      error: "Internal server error",
      errorMessage: error.message
    });
  }
};


//get all the order
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'username email')
      .populate({
        path: 'products.productId',
        select: 'name price', 
      });

    res.status(200).json({ message: "Successfully fetched all orders", data: orders });
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
};


//get single order
export const getSingleOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate({
      path: "products.productId",
      select: "productName productImageUrl", 
    });

    if (!order) {
      return res.status(404).json({ message: "Order cannot be null" });
    }

    res.status(200).json({ message: "Successfully get the single order", data: order });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//get my orders

export const getMyOrder = async (req, res) => {
  const userId = req.user.id;

  const orders = await Order.find({ userId }).populate({
    path: 'products.productId',
    select: 'productName productImageUrl'
  });

  if (orders.length === 0) {
    return res.status(404).json({ message: "Order cannot be null" });
  }

  res.status(200).json({ message: "Successfully get my orders", data: orders });
};

//admin update orderstatus
export const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { orderStatus } = req.body;
    const orders = await Order.findByIdAndUpdate(id,  {orderStatus} , { new: true });
    res.status(200).json({ message: "Successfully update the order", data: orders })

}

// delete order
export const deleteOrder = async (req, res) => {
    const { id } = req.params;
    const orders = await Order.findByIdAndDelete(id);
    if (!orders) {
        return res.status(404).json({ message: "Order cannot be null" });
    }
    res.status(200).json({ message: "Successfully delete the order" })
}


//cancel order
export const cancleOrder = async (req, res) => {
    const { id } = req.params;
    const orders = await Order.findById(id);
    if (!orders) {
        return res.status(404).json({ message: "Order not found" })
    }

    if (orders.orderStatus === "pending") {
        orders.orderStatus = "cancalled";
        await orders.save();
    } else {
        return res.status(404).json({ message: "Order must be pending for the cancellation" })
    }

    res.status(200).json({ message: "Successfully change the order status", hello: orders })

}

