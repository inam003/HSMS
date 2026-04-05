import express from "express";
import { getBills, getMyBills, getBillById, createBill, generateBills, updateBill, processPayment } from "../controllers/billController.js";
import { protect, adminOnly, residentOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, adminOnly, getBills).post(protect, adminOnly, createBill);
router.get("/my-bills", protect, residentOnly, getMyBills);
router.post("/generate", protect, adminOnly, generateBills);
router.route("/:id").get(protect, getBillById).put(protect, adminOnly, updateBill);
router.post("/:id/pay", protect, processPayment);

export default router;
