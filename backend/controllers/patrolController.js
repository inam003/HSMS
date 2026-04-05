import PatrolLog from "../models/PatrolLog.js";

export const getPatrolLogs = async (req, res) => {
  const logs = await PatrolLog.find().populate("guard", "Name Assigned_Gate").sort({ LogTime: -1 });
  res.json(logs);
};

export const getMyPatrolLogs = async (req, res) => {
  const logs = await PatrolLog.find({ guard: req.user._id }).sort({ LogTime: -1 });
  res.json(logs);
};

export const logPatrol = async (req, res) => {
  const log = await PatrolLog.create({ ...req.body, guard: req.user._id, LogTime: new Date() });
  res.status(201).json(log);
};

export const getGateLogs = async (req, res) => {
  const Visitor = (await import("../models/Visitor.js")).default;
  const visitors = await Visitor.find()
    .populate("unit", "Unit_Number Block")
    .populate("guard", "Name")
    .sort({ CheckIn_Time: -1 })
    .limit(50);

  const patrolLogs = await PatrolLog.find().populate("guard", "Name").sort({ LogTime: -1 }).limit(20);

  res.json({ accessLogs: visitors, patrolStatus: patrolLogs });
};
