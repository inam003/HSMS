import express from "express";
import { getVehicles, getMyVehicles, createVehicle, deleteVehicle } from "../controllers/vehicleController.js";
import { protect, adminOnly, residentOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, adminOnly, getVehicles);
router.get("/my-vehicles", protect, residentOnly, getMyVehicles);
router.post("/", protect, residentOnly, createVehicle);
router.delete("/:id", protect, deleteVehicle);

export default router;
