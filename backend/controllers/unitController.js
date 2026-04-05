import Unit from "../models/Unit.js";

export const getUnits = async (req, res) => {
  const units = await Unit.find().populate("resident", "Name Email Contact_No").populate("admin", "Name");
  res.json(units);
};

export const getUnitById = async (req, res) => {
  const unit = await Unit.findById(req.params.id).populate("resident", "Name Email Contact_No").populate("admin", "Name");
  if (!unit) return res.status(404).json({ message: "Unit not found" });
  res.json(unit);
};

export const getMyUnit = async (req, res) => {
  const unit = await Unit.findOne({ resident: req.user._id }).populate("resident", "Name Email Contact_No");
  if (!unit) return res.status(404).json({ message: "No unit assigned" });
  res.json(unit);
};

export const createUnit = async (req, res) => {
  const unit = await Unit.create({ ...req.body, admin: req.user._id });
  res.status(201).json(unit);
};

export const updateUnit = async (req, res) => {
  const unit = await Unit.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!unit) return res.status(404).json({ message: "Unit not found" });
  res.json(unit);
};

export const deleteUnit = async (req, res) => {
  const unit = await Unit.findById(req.params.id);
  if (!unit) return res.status(404).json({ message: "Unit not found" });
  if (unit.Status === "Occupied") return res.status(400).json({ message: "Cannot delete an occupied unit" });
  await unit.deleteOne();
  res.json({ message: "Unit deleted" });
};

export const assignResident = async (req, res) => {
  const { residentId, role } = req.body;
  const unit = await Unit.findById(req.params.id);
  if (!unit) return res.status(404).json({ message: "Unit not found" });
  unit.resident = residentId;
  unit.residentRole = role || "Owner";
  unit.Status = residentId ? "Occupied" : "Vacant";
  await unit.save();
  res.json(unit);
};
