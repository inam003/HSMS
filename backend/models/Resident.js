import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const residentSchema = new mongoose.Schema({
  Name: { type: String, required: true },
  Email: { type: String, required: true, unique: true },
  Password: { type: String, required: true },
  Contact_No: { type: String },
  Is_Owner: { type: Boolean, default: true },
  Emergency_Contact: { type: String },
  Profile_Picture: { type: String, default: "" },
}, { timestamps: true });

residentSchema.pre("save", async function () {
  if (!this.isModified("Password")) return;
  this.Password = await bcrypt.hash(this.Password, 10);
});

residentSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.Password);
};

const Resident = mongoose.model("Resident", residentSchema);
export default Resident;
