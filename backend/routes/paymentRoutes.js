import express from "express";
import { createOrder, verifyPayment, getRazorpayKey, getAllOrders, updateOrderStatus, getUserOrders } from "../controllers/paymentController.js";
import { verifyToken, isAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/key", getRazorpayKey);
router.post("/orders", verifyToken, createOrder);
router.post("/verify", verifyToken, verifyPayment);
router.get("/all-orders", verifyToken, isAdmin, getAllOrders);
router.put("/order-status/:orderId", verifyToken, isAdmin, updateOrderStatus);
router.get("/my-orders", verifyToken, getUserOrders);

export default router;
