import mongoose from "mongoose";

const patrolLogSchema = new mongoose.Schema({
  guard: { type: mongoose.Schema.Types.ObjectId, ref: "SecurityGuard", required: true },
  CheckpointName: { type: String, required: true },
  LogTime: { type: Date, default: Date.now },
  Status: { type: String, enum: ["Completed", "Skipped"], default: "Completed" },
  Notes: { type: String, default: "" },
}, { timestamps: true });

const PatrolLog = mongoose.model("PatrolLog", patrolLogSchema);
export default PatrolLog;
