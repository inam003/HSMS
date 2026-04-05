import express from "express";
import { getPatrolLogs, getMyPatrolLogs, logPatrol, getGateLogs } from "../controllers/patrolController.js";
import { protect, adminOnly, guardOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, adminOnly, getPatrolLogs);
router.get("/my-logs", protect, guardOnly, getMyPatrolLogs);
router.post("/", protect, guardOnly, logPatrol);
router.get("/gate-logs", protect, getGateLogs);

export default router;
