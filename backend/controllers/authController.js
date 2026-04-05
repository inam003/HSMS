import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import Resident from "../models/Resident.js";
import SecurityGuard from "../models/SecurityGuard.js";
import StaffVendor from "../models/StaffVendor.js";

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// @desc    Login for all roles (Admin → Resident → Guard → Staff)
// @route   POST /api/auth/login
export const login = async (req, res) => {
  const { Email, Password } = req.body;
  if (!Email || !Password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  // Check Admin
  let user = await Admin.findOne({ Email });
  if (user && (await user.matchPassword(Password))) {
    return res.json({
      token: generateToken(user._id, "admin"),
      role: "admin",
      user: { _id: user._id, Name: user.Name, Email: user.Email, Role_Level: user.Role_Level },
    });
  }

  // Check Resident
  user = await Resident.findOne({ Email });
  if (user && (await user.matchPassword(Password))) {
    return res.json({
      token: generateToken(user._id, "resident"),
      role: "resident",
      user: { _id: user._id, Name: user.Name, Email: user.Email },
    });
  }

  // Check Security Guard
  user = await SecurityGuard.findOne({ Email });
  if (user && (await user.matchPassword(Password))) {
    return res.json({
      token: generateToken(user._id, "guard"),
      role: "guard",
      user: { _id: user._id, Name: user.Name, Email: user.Email, Assigned_Gate: user.Assigned_Gate },
    });
  }

  // Check Staff / Vendor
  user = await StaffVendor.findOne({ Email });
  if (user && (await user.matchPassword(Password))) {
    return res.json({
      token: generateToken(user._id, "staff"),
      role: "staff",
      user: {
        _id: user._id,
        Name: user.Name,
        Email: user.Email,
        Type: user.Type,
        Entry_Code: user.Entry_Code,
        Availability_Status: user.Availability_Status,
      },
    });
  }

  res.status(401).json({ message: "Invalid email or password" });
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
export const getProfile = async (req, res) => {
  res.json({ user: req.user, role: req.userRole });
};
