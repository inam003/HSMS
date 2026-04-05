import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema({
  Name: { type: String, required: true },
  Email: { type: String, required: true, unique: true },
  Password: { type: String, required: true },
  Role_Level: { type: String, default: "admin" },
  Contact_No: { type: String },
}, { timestamps: true });

adminSchema.pre("save", async function () {
  if (!this.isModified("Password")) return;
  this.Password = await bcrypt.hash(this.Password, 10);
});

adminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.Password);
};

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
