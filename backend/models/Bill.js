import mongoose from "mongoose";

const billSchema = new mongoose.Schema({
  unit: { type: mongoose.Schema.Types.ObjectId, ref: "Unit", required: true },
  Amount: { type: Number, required: true },
  Due_Date: { type: Date, required: true },
  Bill_Type: { type: String, enum: ["Maintenance", "Utility"], required: true },
  Status: { type: String, enum: ["Paid", "Unpaid"], default: "Unpaid" },
}, { timestamps: true });

const Bill = mongoose.model("Bill", billSchema);
export default Bill;
