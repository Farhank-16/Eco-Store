import { Router } from "express";
import { verifyToken, isAdmin } from "../middleware/auth.js";
import {
  addCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";

const router = Router();

router.get("/get", getCategories);

// Admin Only Routes
router.post("/add", verifyToken, isAdmin, addCategory);
router.put("/update/:id", verifyToken, isAdmin, updateCategory);
router.delete("/delete/:id", verifyToken, isAdmin, deleteCategory);

export default router;