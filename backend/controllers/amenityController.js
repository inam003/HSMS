import Amenity from "../models/Amenity.js";
import Booking from "../models/Booking.js";

export const getAmenities = async (req, res) => {
  const amenities = await Amenity.find();
  res.json(amenities);
};

export const createAmenity = async (req, res) => {
  const amenity = await Amenity.create({ ...req.body, admin: req.user._id });
  res.status(201).json(amenity);
};

export const updateAmenity = async (req, res) => {
  const amenity = await Amenity.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!amenity) return res.status(404).json({ message: "Amenity not found" });
  res.json(amenity);
};

export const deleteAmenity = async (req, res) => {
  await Amenity.findByIdAndDelete(req.params.id);
  res.json({ message: "Amenity deleted" });
};

export const getBookings = async (req, res) => {
  const filter = req.userRole === "resident" ? { resident: req.user._id } : {};
  const bookings = await Booking.find(filter)
    .populate("amenity", "Name Capacity Booking_Fee")
    .populate("resident", "Name Email")
    .sort({ createdAt: -1 });
  res.json(bookings);
};

export const createBooking = async (req, res) => {
  const { amenityId, Booking_Date, Time_Slot } = req.body;

  // checkAvailability
  const conflict = await Booking.findOne({
    amenity: amenityId,
    Booking_Date: new Date(Booking_Date),
    Time_Slot,
    Status: { $in: ["Pending", "Confirmed"] },
  });

  if (conflict) return res.status(400).json({ message: "Slot is not available for this date and time" });

  const booking = await Booking.create({
    amenity: amenityId,
    resident: req.user._id,
    Booking_Date,
    Time_Slot,
    Status: "Pending",
  });

  res.status(201).json(booking);
};

export const updateBooking = async (req, res) => {
  const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .populate("amenity", "Name")
    .populate("resident", "Name Email");
  if (!booking) return res.status(404).json({ message: "Booking not found" });
  res.json(booking);
};
