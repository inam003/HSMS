import Admin from "../models/Admin.js";

// @desc Get admin profile
// @route GET /api/admin/profile
export const getAdminProfile = async (req, res) => {
  const admin = await Admin.findById(req.user._id).select("-Password");
  res.json(admin);
};

// @desc Update admin profile
// @route PUT /api/admin/profile
export const updateAdminProfile = async (req, res) => {
  const admin = await Admin.findById(req.user._id);
  if (!admin) return res.status(404).json({ message: "Admin not found" });

  admin.Name = req.body.Name || admin.Name;
  admin.Contact_No = req.body.Contact_No || admin.Contact_No;
  if (req.body.Password) admin.Password = req.body.Password;

  const updated = await admin.save();
  res.json({ _id: updated._id, Name: updated.Name, Email: updated.Email, Contact_No: updated.Contact_No });
};

// @desc Create initial admin (seeder) — no request body needed
// @route POST /api/admin/seed
export const seedAdmin = async (req, res) => {
  const DEFAULT_EMAIL = "admin@hsms.com";

  const exists = await Admin.findOne({ Email: DEFAULT_EMAIL });
  if (exists) {
    return res.status(400).json({ message: "Default admin already exists. Login with admin@hsms.com / admin123" });
  }

  const admin = await Admin.create({
    Name: "System Administrator",
    Email: DEFAULT_EMAIL,
    Password: "admin123",
    Role_Level: "admin",
    Contact_No: "0300-0000000",
  });

  res.status(201).json({
    message: "Default admin created successfully!",
    credentials: { Email: admin.Email, Password: "admin123" },
  });
};
