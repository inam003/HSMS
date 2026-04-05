import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import Resident from "../models/Resident.js";
import SecurityGuard from "../models/SecurityGuard.js";
import StaffVendor from "../models/StaffVendor.js";

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.role === "admin") {
        req.user = await Admin.findById(decoded.id).select("-Password");
      } else if (decoded.role === "resident") {
        req.user = await Resident.findById(decoded.id).select("-Password");
      } else if (decoded.role === "guard") {
        req.user = await SecurityGuard.findById(decoded.id).select("-Password");
      } else if (decoded.role === "staff") {
        req.user = await StaffVendor.findById(decoded.id).select("-Password");
      }

      req.userRole = decoded.role;
      next();
    } catch (error) {
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.userRole === "admin") return next();
  res.status(403).json({ message: "Access denied: Admins only" });
};

export const residentOnly = (req, res, next) => {
  if (req.userRole === "resident") return next();
  res.status(403).json({ message: "Access denied: Residents only" });
};

export const guardOnly = (req, res, next) => {
  if (req.userRole === "guard") return next();
  res.status(403).json({ message: "Access denied: Guards only" });
};

export const staffOnly = (req, res, next) => {
  if (req.userRole === "staff") return next();
  res.status(403).json({ message: "Access denied: Staff only" });
};

export const adminOrGuard = (req, res, next) => {
  if (req.userRole === "admin" || req.userRole === "guard") return next();
  res.status(403).json({ message: "Access denied: Admins or Guards only" });
};
