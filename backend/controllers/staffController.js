import StaffVendor from "../models/StaffVendor.js";
import StaffAttendance from "../models/StaffAttendance.js";

// ─── ADMIN: Staff/Vendor CRUD ───────────────────────────────────────────────

export const getStaff = async (req, res) => {
  const staff = await StaffVendor.find().populate("admin", "Name").select("-Password");
  res.json(staff);
};

export const getStaffById = async (req, res) => {
  const staff = await StaffVendor.findById(req.params.id).select("-Password");
  if (!staff) return res.status(404).json({ message: "Staff not found" });
  res.json(staff);
};

export const createStaff = async (req, res) => {
  const { Name, Email, Password, Type, Aadhar_CNIC_No, Rating } = req.body;
  if (!Email || !Password) {
    return res.status(400).json({ message: "Email and Password are required" });
  }
  const exists = await StaffVendor.findOne({ Email });
  if (exists) return res.status(400).json({ message: "Email already registered" });
  const staff = await StaffVendor.create({ Name, Email, Password, Type, Aadhar_CNIC_No, Rating, admin: req.user._id });
  const result = staff.toObject();
  delete result.Password;
  res.status(201).json(result);
};

export const updateStaff = async (req, res) => {
  // Prevent direct password update through this route
  delete req.body.Password;
  const staff = await StaffVendor.findByIdAndUpdate(req.params.id, req.body, { new: true }).select("-Password");
  if (!staff) return res.status(404).json({ message: "Staff not found" });
  res.json(staff);
};

export const deleteStaff = async (req, res) => {
  const staff = await StaffVendor.findByIdAndDelete(req.params.id);
  if (!staff) return res.status(404).json({ message: "Staff not found" });
  res.json({ message: "Staff deleted" });
};

// ─── GUARD: Validate Entry Code ─────────────────────────────────────────────

export const validateEntryCode = async (req, res) => {
  const { entryCode } = req.body;
  const staff = await StaffVendor.findOne({ Entry_Code: entryCode }).select("-Password");
  if (!staff) return res.status(404).json({ message: "Invalid entry code" });
  res.json({ valid: true, staff });
};

// ─── STAFF PORTAL: My Profile ────────────────────────────────────────────────

export const getMyProfile = async (req, res) => {
  const staff = await StaffVendor.findById(req.user._id).select("-Password").populate("admin", "Name Email");
  if (!staff) return res.status(404).json({ message: "Profile not found" });
  res.json(staff);
};

export const updateAvailability = async (req, res) => {
  const { Availability_Status } = req.body;
  const staff = await StaffVendor.findByIdAndUpdate(
    req.user._id,
    { Availability_Status },
    { new: true }
  ).select("-Password");
  res.json(staff);
};

// ─── STAFF PORTAL: Attendance (Check-In / Check-Out) ────────────────────────

export const staffCheckIn = async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if already checked in today
  const existing = await StaffAttendance.findOne({
    staff: req.user._id,
    Date: { $gte: today },
  });

  if (existing && existing.CheckIn_Time) {
    return res.status(400).json({ message: "Already checked in today" });
  }

  const attendance = existing
    ? await StaffAttendance.findByIdAndUpdate(
        existing._id,
        { CheckIn_Time: new Date(), Status: "Present" },
        { new: true }
      )
    : await StaffAttendance.create({
        staff: req.user._id,
        Date: today,
        CheckIn_Time: new Date(),
        Status: "Present",
        Notes: req.body?.Notes || "",
      });

  // Update availability status
  await StaffVendor.findByIdAndUpdate(req.user._id, { Availability_Status: "On Duty" });

  res.status(201).json({ message: "Checked in successfully", attendance });
};

export const staffCheckOut = async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const attendance = await StaffAttendance.findOne({
    staff: req.user._id,
    Date: { $gte: today },
    CheckIn_Time: { $exists: true },
  });

  if (!attendance) {
    return res.status(400).json({ message: "No check-in found for today" });
  }
  if (attendance.CheckOut_Time) {
    return res.status(400).json({ message: "Already checked out today" });
  }

  attendance.CheckOut_Time = new Date();

  // Determine if Half-Day (less than 4 hours on duty)
  const hoursWorked = (attendance.CheckOut_Time - attendance.CheckIn_Time) / (1000 * 60 * 60);
  if (hoursWorked < 4) attendance.Status = "Half-Day";

  if (req.body?.Notes) attendance.Notes = req.body.Notes;
  await attendance.save();

  // Update availability status
  await StaffVendor.findByIdAndUpdate(req.user._id, { Availability_Status: "Off Duty" });

  res.json({ message: "Checked out successfully", attendance });
};

export const getMyAttendance = async (req, res) => {
  const records = await StaffAttendance.find({ staff: req.user._id })
    .sort({ Date: -1 })
    .limit(30);
  res.json(records);
};

// ─── ADMIN: View All Attendance ──────────────────────────────────────────────

export const getAllAttendance = async (req, res) => {
  const records = await StaffAttendance.find()
    .populate("staff", "Name Type Entry_Code")
    .sort({ Date: -1 })
    .limit(100);
  res.json(records);
};
