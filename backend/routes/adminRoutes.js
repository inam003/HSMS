import express from "express";
import { getAdminProfile, updateAdminProfile, seedAdmin } from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/seed", seedAdmin); // public - for initial setup
router.get("/profile", protect, adminOnly, getAdminProfile);
router.put("/profile", protect, adminOnly, updateAdminProfile);

export default router;
