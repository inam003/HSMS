import mongoose from "mongoose";

const visitorSchema = new mongoose.Schema({
  Name: { type: String, required: true },
  Contact_No: { type: String },
  Purpose: { type: String },
  CheckIn_Time: { type: Date, default: Date.now },
  CheckOut_Time: { type: Date, default: null },
  guard: { type: mongoose.Schema.Types.ObjectId, ref: "SecurityGuard" },
  unit: { type: mongoose.Schema.Types.ObjectId, ref: "Unit" },
  isPreApproved: { type: Boolean, default: false },
  preApprovedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Resident", default: null },
  Vehicle_Number: { type: String, default: "" },
  expectedArrival: { type: Date, default: null },
  preApprovalUsed: { type: Boolean, default: false },
}, { timestamps: true });

const Visitor = mongoose.model("Visitor", visitorSchema);
export default Visitor;
