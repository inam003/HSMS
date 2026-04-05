import mongoose from "mongoose";

const pollSchema = new mongoose.Schema({
  Title: { type: String, required: true },
  Description: { type: String },
  StartDate: { type: Date, required: true },
  EndDate: { type: Date, required: true },
  PollType: { type: String, enum: ["General", "Election"], default: "General" },
  IsActive: { type: Boolean, default: true },
  ResultsVisible: { type: Boolean, default: false },
  voters: [{ type: mongoose.Schema.Types.ObjectId, ref: "Resident" }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
}, { timestamps: true });

const Poll = mongoose.model("Poll", pollSchema);
export default Poll;
