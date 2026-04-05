import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({
  resident: { type: mongoose.Schema.Types.ObjectId, ref: "Resident", required: true },
  Category: { type: String, required: true },
  Description: { type: String, required: true },
  Status: {
    type: String,
    enum: ["Pending", "In Progress", "Resolved"],
    default: "Pending",
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "StaffVendor", default: null },
  feedback: { type: String, default: "" },
}, { timestamps: true });

const Complaint = mongoose.model("Complaint", complaintSchema);
export default Complaint;
