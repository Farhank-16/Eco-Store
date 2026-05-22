import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    products: [
      {
        product: {
          type: mongoose.ObjectId,
          ref: "product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    buyer: {
      type: mongoose.ObjectId,
      ref: "User",
      required: true,
    },
    payment: {
      razorpay_order_id: String,
      razorpay_payment_id: String,
      razorpay_signature: String,
      status: { type: String, default: "Success" },
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      default: "Processing",
      enum: ["Processing", "Packed", "Dispatched", "Shipped", "Out for Delivery", "Delivered", "Cancelled"],
    },
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);