import mongoose from "mongoose";
import crypto from "crypto";
import bcrypt from "bcryptjs";

const staffVendorSchema = new mongoose.Schema({
  Name: { type: String, required: true },
  Email: { type: String, required: true, unique: true },
  Password: { type: String, required: true },
  Type: { type: String, required: true }, // Maid, Driver, Plumber, Electrician, etc.
  Aadhar_CNIC_No: { type: String },
  Entry_Code: { type: String, unique: true },
  Rating: { type: Number, default: 0, min: 0, max: 5 },
  Availability_Status: { type: String, enum: ["Available", "On Duty", "Off Duty"], default: "Available" },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
}, { timestamps: true });

// Auto-generate Entry_Code and hash Password before saving
staffVendorSchema.pre("save", async function () {
  if (!this.Entry_Code) {
    this.Entry_Code = crypto.randomBytes(4).toString("hex").toUpperCase();
  }
  if (this.isModified("Password")) {
    const salt = await bcrypt.genSalt(10);
    this.Password = await bcrypt.hash(this.Password, salt);
  }
});

staffVendorSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.Password);
};

const StaffVendor = mongoose.model("StaffVendor", staffVendorSchema);
export default StaffVendor;
