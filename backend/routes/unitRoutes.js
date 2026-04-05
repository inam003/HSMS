import express from "express";
import { getUnits, getUnitById, getMyUnit, createUnit, updateUnit, deleteUnit, assignResident } from "../controllers/unitController.js";
import { protect, adminOnly, residentOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getUnits).post(protect, adminOnly, createUnit);
router.get("/my-unit", protect, residentOnly, getMyUnit);
router.route("/:id").get(protect, getUnitById).put(protect, adminOnly, updateUnit).delete(protect, adminOnly, deleteUnit);
router.post("/:id/assign", protect, adminOnly, assignResident);

export default router;
