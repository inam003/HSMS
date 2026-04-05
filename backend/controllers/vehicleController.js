import Vehicle from "../models/Vehicle.js";

export const getVehicles = async (req, res) => {
  const vehicles = await Vehicle.find().populate("resident", "Name");
  res.json(vehicles);
};

export const getMyVehicles = async (req, res) => {
  const vehicles = await Vehicle.find({ resident: req.user._id });
  res.json(vehicles);
};

export const createVehicle = async (req, res) => {
  const vehicle = await Vehicle.create({ ...req.body, resident: req.user._id });
  res.status(201).json(vehicle);
};

export const deleteVehicle = async (req, res) => {
  const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
  if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
  res.json({ message: "Vehicle removed" });
};
