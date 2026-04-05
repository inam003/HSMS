import express from "express";
import { getVisitors, registerEntry, registerExit, preApproveVisitor, getPreApprovals } from "../controllers/visitorController.js";
import { protect, adminOnly, guardOnly, residentOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getVisitors);
router.post("/entry", protect, guardOnly, registerEntry);
router.put("/:id/exit", protect, guardOnly, registerExit);
router.post("/pre-approve", protect, residentOnly, preApproveVisitor);
router.get("/my-pre-approvals", protect, residentOnly, getPreApprovals);

export default router;
