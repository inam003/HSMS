import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema({
  Vehicle_Number: { type: String, required: true },
  Type: { type: String, enum: ["2-wheeler", "4-wheeler"], required: true },
  resident: { type: mongoose.Schema.Types.ObjectId, ref: "Resident", required: true },
}, { timestamps: true });

const Vehicle = mongoose.model("Vehicle", vehicleSchema);
export default Vehicle;
