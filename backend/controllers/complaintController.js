import Complaint from "../models/Complaint.js";

export const getComplaints = async (req, res) => {
  const filter = req.userRole === "resident" ? { resident: req.user._id } : {};
  const complaints = await Complaint.find(filter)
    .populate("resident", "Name Email")
    .populate("assignedTo", "Name Type")
    .sort({ createdAt: -1 });
  res.json(complaints);
};

export const createComplaint = async (req, res) => {
  const complaint = await Complaint.create({ ...req.body, resident: req.user._id });
  res.status(201).json(complaint);
};

export const updateComplaint = async (req, res) => {
  const complaint = await Complaint.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .populate("resident", "Name Email")
    .populate("assignedTo", "Name Type");
  if (!complaint) return res.status(404).json({ message: "Complaint not found" });
  res.json(complaint);
};

export const submitFeedback = async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) return res.status(404).json({ message: "Complaint not found" });
  if (complaint.resident.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not your complaint" });
  }
  complaint.feedback = req.body.feedback;
  await complaint.save();
  res.json(complaint);
};
