import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const securityGuardSchema = new mongoose.Schema({
  Name: { type: String, required: true },
  Shift_Timing: { type: String },
  Contact_No: { type: String },
  Assigned_Gate: { type: String },
  Email: { type: String, unique: true, required: true },
  Password: { type: String, required: true },
}, { timestamps: true });

securityGuardSchema.pre("save", async function () {
  if (!this.isModified("Password")) return;
  this.Password = await bcrypt.hash(this.Password, 10);
});

securityGuardSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.Password);
};

const SecurityGuard = mongoose.model("SecurityGuard", securityGuardSchema);
export default SecurityGuard;
