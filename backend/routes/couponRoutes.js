import { Router } from "express";
import { verifyToken, isAdmin } from "../middleware/auth.js";
import {
  getCoupons,
  addCoupon,
  updateCoupon,
  deleteCoupon,
  applyCoupon,
  getActiveCoupons,
} from "../controllers/couponController.js";

const router = Router();

// Apply Coupon (Public/Authenticated)
router.post("/apply", verifyToken, applyCoupon);
router.get("/active", verifyToken, getActiveCoupons);

// Admin Only Routes
router.get("/get", verifyToken, isAdmin, getCoupons);
router.post("/add", verifyToken, isAdmin, addCoupon);
router.put("/update/:id", verifyToken, isAdmin, updateCoupon);
router.delete("/delete/:id", verifyToken, isAdmin, deleteCoupon);

export default router;
