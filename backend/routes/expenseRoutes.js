import express from "express";
import { getExpenses, createExpense, updateExpense, deleteExpense, getReports } from "../controllers/expenseController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, adminOnly, getExpenses).post(protect, adminOnly, createExpense);
router.route("/:id").put(protect, adminOnly, updateExpense).delete(protect, adminOnly, deleteExpense);
router.get("/reports/summary", protect, adminOnly, getReports);

export default router;
