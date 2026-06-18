import Coupon from "../models/couponModel.js";

export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, minCartAmount, expiryDate, isActive } = req.body;
    
    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: "Coupon code already exists" });
    }

    const newCoupon = new Coupon({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minCartAmount: minCartAmount || 0,
      expiryDate,
      isActive: isActive !== undefined ? isActive : true,
    });

    await newCoupon.save();
    res.status(201).json({ success: true, message: "Coupon created", coupon: newCoupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Coupon.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }
    res.status(200).json({ success: true, message: "Coupon updated", coupon: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Coupon.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }
    res.status(200).json({ success: true, message: "Coupon deleted", coupon: deleted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const applyCoupon = async (req, res) => {
  try {
    const { code, cartAmount } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: "Coupon code is required" });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Invalid or inactive coupon code" });
    }

    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ success: false, message: "Coupon has expired" });
    }

    if (cartAmount < coupon.minCartAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${coupon.minCartAmount} required to use this coupon`,
      });
    }

    let discount = 0;
    if (coupon.discountType === "percentage") {
      discount = (cartAmount * coupon.discountValue) / 100;
    } else {
      discount = coupon.discountValue;
    }

    if (discount > cartAmount) {
      discount = cartAmount;
    }

    res.status(200).json({
      success: true,
      message: "Coupon applied successfully",
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
      discountAmount: Number(discount.toFixed(2)),
      finalAmount: Number((cartAmount - discount).toFixed(2)),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
