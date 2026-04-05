import mongoose from "mongoose";

const unitSchema = new mongoose.Schema({
  Unit_Number: { type: String, required: true, unique: true },
  Floor: { type: String },
  Block: { type: String },
  Square_Footage: { type: Number },
  Status: { type: String, enum: ["Occupied", "Vacant"], default: "Vacant" },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  resident: { type: mongoose.Schema.Types.ObjectId, ref: "Resident", default: null },
  residentRole: { type: String, enum: ["Owner", "Tenant"], default: null },
}, { timestamps: true });

const Unit = mongoose.model("Unit", unitSchema);
export default Unit;
