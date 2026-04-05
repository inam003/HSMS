import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema({
  Title: { type: String, required: true },
  Content: { type: String, required: true },
  NoticeType: {
    type: String,
    enum: ["General", "Emergency", "Meeting", "Maintenance"],
    default: "General",
  },
  publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  PublishDate: { type: Date, default: Date.now },
  ExpiryDate: { type: Date },
  Priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
  IsActive: { type: Boolean, default: false },
}, { timestamps: true });

const Notice = mongoose.model("Notice", noticeSchema);
export default Notice;
