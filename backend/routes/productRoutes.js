import { Router } from "express";
import upload from "../middleware/upload.js";
import { verifyToken, isAdmin } from "../middleware/auth.js";
import {
  getProducts,
  addProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  addBulkProducts,
} from "../controllers/productController.js";

const router = Router();

router.get("/get", getProducts);
router.get("/get/:id", getProductById);

// Admin Only Routes
router.post("/add", verifyToken, isAdmin, upload.array("images", 10), addProduct);
router.post("/add-bulk", verifyToken, isAdmin, addBulkProducts);
router.put("/update/:id", verifyToken, isAdmin, upload.array("images", 10), updateProduct);
router.delete("/delete/:id", verifyToken, isAdmin, deleteProduct);

export default router;


