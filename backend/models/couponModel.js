import { Schema, model } from "mongoose";

const couponSchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  discountType: {
    type: String,
    enum: ["percentage", "flat"],
    default: "percentage",
  },
  discountValue: {
    type: Number,
    required: true,
    min: [1, "Discount value must be at least 1"],
  },
  minCartAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  expiryDate: {
    type: Date,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

const Coupon = model("coupon", couponSchema);
export default Coupon;
