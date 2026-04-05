import express from "express";
import { getNotices, createNotice, updateNotice, publishNotice, expireNotice, deleteNotice, triggerSOS } from "../controllers/noticeController.js";
import { protect, adminOnly, residentOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getNotices).post(protect, adminOnly, createNotice);
router.post("/sos", protect, residentOnly, triggerSOS);
router.route("/:id").put(protect, adminOnly, updateNotice).delete(protect, adminOnly, deleteNotice);
router.put("/:id/publish", protect, adminOnly, publishNotice);
router.put("/:id/expire", protect, adminOnly, expireNotice);

export default router;
