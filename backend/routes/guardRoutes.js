import express from "express";
import { getGuards, createGuard, updateGuard, deleteGuard } from "../controllers/guardController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, adminOnly, getGuards).post(protect, adminOnly, createGuard);
router.route("/:id").put(protect, adminOnly, updateGuard).delete(protect, adminOnly, deleteGuard);

export default router;
