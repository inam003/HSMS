import express from "express";
import { getPolls, createPoll, getPollWithOptions, vote, closePoll, deletePoll } from "../controllers/pollController.js";
import { protect, adminOnly, residentOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getPolls).post(protect, adminOnly, createPoll);
router.get("/:id", protect, getPollWithOptions);
router.post("/:id/vote", protect, residentOnly, vote);
router.put("/:id/close", protect, adminOnly, closePoll);
router.delete("/:id", protect, adminOnly, deletePoll);

export default router;
