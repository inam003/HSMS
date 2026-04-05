import SecurityGuard from "../models/SecurityGuard.js";

export const getGuards = async (req, res) => {
  const guards = await SecurityGuard.find().select("-Password");
  res.json(guards);
};

export const createGuard = async (req, res) => {
  const exists = await SecurityGuard.findOne({ Email: req.body.Email });
  if (exists) return res.status(400).json({ message: "Email already in use" });
  const guard = await SecurityGuard.create(req.body);
  res.status(201).json({ _id: guard._id, Name: guard.Name, Email: guard.Email });
};

export const updateGuard = async (req, res) => {
  const guard = await SecurityGuard.findById(req.params.id);
  if (!guard) return res.status(404).json({ message: "Guard not found" });
  Object.assign(guard, req.body);
  const updated = await guard.save();
  res.json({ _id: updated._id, Name: updated.Name, Email: updated.Email });
};

export const deleteGuard = async (req, res) => {
  await SecurityGuard.findByIdAndDelete(req.params.id);
  res.json({ message: "Guard deleted" });
};
