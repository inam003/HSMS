import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  amenity: { type: mongoose.Schema.Types.ObjectId, ref: "Amenity", required: true },
  resident: { type: mongoose.Schema.Types.ObjectId, ref: "Resident", required: true },
  Booking_Date: { type: Date, required: true },
  Time_Slot: { type: String, required: true },
  Status: { type: String, enum: ["Pending", "Confirmed", "Cancelled"], default: "Pending" },
}, { timestamps: true });

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
