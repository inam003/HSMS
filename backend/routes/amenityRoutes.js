import express from "express";
import { getAmenities, createAmenity, updateAmenity, deleteAmenity, getBookings, createBooking, updateBooking } from "../controllers/amenityController.js";
import { protect, adminOnly, residentOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getAmenities).post(protect, adminOnly, createAmenity);
router.route("/:id").put(protect, adminOnly, updateAmenity).delete(protect, adminOnly, deleteAmenity);
router.route("/bookings").get(protect, getBookings).post(protect, residentOnly, createBooking);
router.put("/bookings/:id", protect, updateBooking);

export default router;
