import { Router } from "express";
import { verifyToken, isAdmin } from "../middleware/auth.js";
import { getAllUsers, getAdminDashboard } from "../controllers/adminController.js";

const router = Router();

// Apply verifyToken and isAdmin middleware to all admin routes
router.use(verifyToken, isAdmin);

// Admin routes
router.get("/users", getAllUsers);
router.get("/dashboard", getAdminDashboard);

export default router;
