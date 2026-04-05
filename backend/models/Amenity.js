import mongoose from "mongoose";

const amenitySchema = new mongoose.Schema({
  Name: { type: String, required: true },
  Capacity: { type: Number, required: true },
  Booking_Fee: { type: Number, default: 0 },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  Description: { type: String, default: "" },
}, { timestamps: true });

const Amenity = mongoose.model("Amenity", amenitySchema);
export default Amenity;
