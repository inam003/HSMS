import Visitor from "../models/Visitor.js";

export const getVisitors = async (req, res) => {
  const visitors = await Visitor.find()
    .populate("unit", "Unit_Number Block Floor")
    .populate("guard", "Name")
    .sort({ createdAt: -1 });
  res.json(visitors);
};

export const registerEntry = async (req, res) => {
  // verifyResidentApproval: check if pre-approved visitor exists
  const { Name, Contact_No, Purpose, unitId, Vehicle_Number } = req.body;

  let isPreApproved = false;
  let preApprovedBy = null;

  const preApproval = await Visitor.findOne({
    Name: { $regex: Name, $options: "i" },
    unit: unitId,
    isPreApproved: true,
    preApprovalUsed: false,
    CheckOut_Time: null,
  });

  if (preApproval) {
    isPreApproved = true;
    preApprovedBy = preApproval.preApprovedBy;
    preApproval.preApprovalUsed = true;
    await preApproval.save();
  }

  const visitor = await Visitor.create({
    Name, Contact_No, Purpose,
    unit: unitId,
    guard: req.user._id,
    Vehicle_Number,
    isPreApproved,
    preApprovedBy,
    CheckIn_Time: new Date(),
  });

  res.status(201).json({ visitor, isPreApproved });
};

export const registerExit = async (req, res) => {
  const visitor = await Visitor.findByIdAndUpdate(
    req.params.id,
    { CheckOut_Time: new Date() },
    { new: true }
  );
  if (!visitor) return res.status(404).json({ message: "Visitor not found" });
  res.json(visitor);
};

export const preApproveVisitor = async (req, res) => {
  const { Name, Contact_No, Vehicle_Number, expectedArrival, unitId } = req.body;
  const preApproval = await Visitor.create({
    Name, Contact_No, Vehicle_Number,
    expectedArrival,
    unit: unitId,
    isPreApproved: true,
    preApprovedBy: req.user._id,
    Purpose: "Pre-Approved Guest",
    CheckIn_Time: null,
  });
  res.status(201).json(preApproval);
};

export const getPreApprovals = async (req, res) => {
  const approvals = await Visitor.find({
    preApprovedBy: req.user._id,
    isPreApproved: true,
  }).populate("unit", "Unit_Number Block");
  res.json(approvals);
};
