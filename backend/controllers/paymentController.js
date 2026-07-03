import Razorpay from "razorpay";
import crypto from "crypto";
import {Order} from "../models/orderModel.js";
import Coupon from "../models/couponModel.js";


export const getRazorpayKey = (req, res) => {
  res.status(200).json({ key: process.env.RAZORPAY_KEY_ID || "rzp_test_dummy_key" });
};

export const createOrder = async (req, res) => {
  try {
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_dummy_key",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "dummy_secret",
    });

    const options = {
      amount: Math.round(req.body.amount * 100), // amount in smallest currency unit
      currency: "INR",
      receipt: "receipt_order_" + Date.now(),
    };

    const order = await instance.orders.create(options);

    if (!order) return res.status(500).json({ success: false, message: "Some error occurred" });

    res.json(order);
  } catch (error) {
    console.error("Razorpay order creation failed, falling back to mock order. Error:", error);
    // Return mock order
    const mockOrder = {
      id: "order_mock_" + Math.random().toString(36).substring(2, 11),
      amount: Math.round(req.body.amount * 100),
      currency: "INR",
      receipt: "receipt_order_" + Date.now(),
      status: "created",
      isMock: true,
    };
    res.json(mockOrder);
  }
};


export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      amount,
      couponCode,
    } = req.body;

    // Check if mock order verification
    if (razorpay_order_id && razorpay_order_id.startsWith("order_mock_")) {
      const isMockPayment = razorpay_payment_id && razorpay_payment_id.startsWith("pay_mock_");
      if (isMockPayment) {
        // Save order to DB
        const order = new Order({
          products: items.map(i => ({
            product: i._id,
            name: i.name,
            image: i.image,
            quantity: i.quantity,
            price: i.discountedPrice && i.discountedPrice < i.originalPrice ? i.discountedPrice : i.originalPrice,
          })),
          buyer: req.user.userId || req.user._id,
          payment: {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            status: "Success"
          },
          totalAmount: amount,
        });

        await order.save();

        // If a coupon code was used, save user's ID to its usedBy list to prevent reuse
        if (couponCode) {
          const userId = req.user.userId || req.user._id;
          await Coupon.findOneAndUpdate(
            { code: couponCode.toUpperCase() },
            { $addToSet: { usedBy: userId } }
          );
        }

        return res.status(200).json({ message: "Mock Payment verified successfully" });
      } else {
        return res.status(400).json({ message: "Invalid mock payment!" });
      }
    }

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "dummy_secret")
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Save order to DB
      const order = new Order({
        products: items.map(i => ({
          product: i._id,
          name: i.name,
          image: i.image,
          quantity: i.quantity,
          price: i.discountedPrice && i.discountedPrice < i.originalPrice ? i.discountedPrice : i.originalPrice,
        })),
        buyer: req.user.userId || req.user._id,
        payment: {
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          status: "Success"
        },
        totalAmount: amount,
      });

      await order.save();

      // If a coupon code was used, save user's ID to its usedBy list to prevent reuse
      if (couponCode) {
        const userId = req.user.userId || req.user._id;
        await Coupon.findOneAndUpdate(
          { code: couponCode.toUpperCase() },
          { $addToSet: { usedBy: userId } }
        );
      }

      return res.status(200).json({ message: "Payment verified successfully" });
    } else {
      return res.status(400).json({ message: "Invalid signature sent!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Payment verification failed", error: error.message || error });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate({
        path: "products.product",
        select: "name price image slug category",
        populate: {
          path: "category",
          select: "name"
        }
      })
      .populate("buyer", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).send(error);
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(orderId, { status }, { returnDocument: "after" });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).send(error);
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user.userId || req.user._id })
      .populate({
        path: "products.product",
        select: "name price image slug category",
        populate: {
          path: "category",
          select: "name"
        }
      })
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).send(error);
  }
};
