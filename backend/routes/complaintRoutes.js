import express from "express";
import { getComplaints, createComplaint, updateComplaint, submitFeedback } from "../controllers/complaintController.js";
import { protect, adminOnly, residentOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getComplaints).post(protect, residentOnly, createComplaint);
router.route("/:id").put(protect, adminOnly, updateComplaint);
router.post("/:id/feedback", protect, residentOnly, submitFeedback);

export default router;
