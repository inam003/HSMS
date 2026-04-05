import mongoose from "mongoose";

const staffAttendanceSchema = new mongoose.Schema({
  staff: { type: mongoose.Schema.Types.ObjectId, ref: "StaffVendor", required: true },
  Date: { type: Date, required: true },
  CheckIn_Time: { type: Date },
  CheckOut_Time: { type: Date },
  Status: { type: String, enum: ["Present", "Absent", "Half-Day"], default: "Present" },
  Notes: { type: String, default: "" },
}, { timestamps: true });

const StaffAttendance = mongoose.model("StaffAttendance", staffAttendanceSchema);
export default StaffAttendance;
