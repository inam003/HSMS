import express from "express";
import {
  getResidents, getResidentById, createResident, updateResident, deleteResident,
} from "../controllers/residentController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, adminOnly, getResidents).post(protect, adminOnly, createResident);
router.route("/:id").get(protect, getResidentById).put(protect, adminOnly, updateResident).delete(protect, adminOnly, deleteResident);

export default router;
