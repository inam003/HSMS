import mongoose from "mongoose";

const pollOptionSchema = new mongoose.Schema({
  poll: { type: mongoose.Schema.Types.ObjectId, ref: "Poll", required: true },
  OptionText: { type: String, required: true },
  VoteCount: { type: Number, default: 0 },
}, { timestamps: true });

const PollOption = mongoose.model("PollOption", pollOptionSchema);
export default PollOption;
