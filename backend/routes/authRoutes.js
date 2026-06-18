import {Router} from "express";
import { verifyToken, isAdmin } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

import {
    registerUser,
    loginUser, 
    logoutUser,
    getProfile,
    updateProfile
} from "../controllers/authController.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, upload.single("image"), updateProfile);

export default router;