import express from "express";
import {
  getStaff, getStaffById, createStaff, updateStaff, deleteStaff,
  validateEntryCode,
  getMyProfile, updateAvailability,
  staffCheckIn, staffCheckOut, getMyAttendance,
  getAllAttendance,
} from "../controllers/staffController.js";
import { protect, adminOnly, guardOnly, staffOnly, adminOrGuard } from "../middleware/authMiddleware.js";

const router = express.Router();

// ─── Admin: Staff/Vendor CRUD ───────────────────────────────
router.route("/")
  .get(protect, getStaff)
  .post(protect, adminOnly, createStaff);

// ─── Guard: Validate entry code ─────────────────────────────
router.post("/validate-code", protect, adminOrGuard, validateEntryCode);

// ─── Admin: View all attendance records ─────────────────────
router.get("/attendance/all", protect, adminOnly, getAllAttendance);

// ─── Staff Portal: Profile & Availability ───────────────────
router.get("/me", protect, staffOnly, getMyProfile);
router.put("/me/availability", protect, staffOnly, updateAvailability);

// ─── Staff Portal: Attendance ────────────────────────────────
router.post("/attendance/checkin", protect, staffOnly, staffCheckIn);
router.post("/attendance/checkout", protect, staffOnly, staffCheckOut);
router.get("/attendance/my", protect, staffOnly, getMyAttendance);

// ─── Admin: Get / Update / Delete by ID ─────────────────────
router.route("/:id")
  .get(protect, getStaffById)
  .put(protect, adminOnly, updateStaff)
  .delete(protect, adminOnly, deleteStaff);

export default router;
