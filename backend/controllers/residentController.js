import Resident from "../models/Resident.js";

// @desc Get all residents
// @route GET /api/residents
export const getResidents = async (req, res) => {
  const residents = await Resident.find().select("-Password");
  res.json(residents);
};

// @desc Get single resident
// @route GET /api/residents/:id
export const getResidentById = async (req, res) => {
  const resident = await Resident.findById(req.params.id).select("-Password");
  if (!resident) return res.status(404).json({ message: "Resident not found" });
  res.json(resident);
};

// @desc Create resident
// @route POST /api/residents
export const createResident = async (req, res) => {
  const exists = await Resident.findOne({ Email: req.body.Email });
  if (exists) return res.status(400).json({ message: "Email already in use" });
  const resident = await Resident.create(req.body);
  res.status(201).json({ _id: resident._id, Name: resident.Name, Email: resident.Email });
};

// @desc Update resident
// @route PUT /api/residents/:id
export const updateResident = async (req, res) => {
  const resident = await Resident.findById(req.params.id);
  if (!resident) return res.status(404).json({ message: "Resident not found" });

  Object.assign(resident, req.body);
  const updated = await resident.save();
  res.json({ _id: updated._id, Name: updated.Name, Email: updated.Email });
};

// @desc Delete resident
// @route DELETE /api/residents/:id
export const deleteResident = async (req, res) => {
  const resident = await Resident.findByIdAndDelete(req.params.id);
  if (!resident) return res.status(404).json({ message: "Resident not found" });
  res.json({ message: "Resident deleted" });
};
