import { Router } from "express";
import upload from "../middleware/upload.js";
import { verifyToken, isAdmin } from "../middleware/auth.js";
import {
  getCollectionConfigs,
  updateCollectionConfig,
  createCollectionConfig,
  deleteCollectionConfig,
} from "../controllers/collectionConfigController.js";

const router = Router();

router.get("/get", getCollectionConfigs);
router.post(
  "/add",
  verifyToken,
  isAdmin,
  upload.single("image"),
  createCollectionConfig
);
router.put(
  "/update/:key",
  verifyToken,
  isAdmin,
  upload.single("image"),
  updateCollectionConfig
);
router.delete(
  "/delete/:key",
  verifyToken,
  isAdmin,
  deleteCollectionConfig
);

export default router;

