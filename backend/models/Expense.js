import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
  ExpenseCategory: {
    type: String,
    enum: ["Salary", "Repair", "Utility", "Other"],
    required: true,
  },
  Amount: { type: Number, required: true },
  ExpenseDate: { type: Date, required: true },
  Description: { type: String },
  PaymentStatus: { type: String, enum: ["Paid", "Pending"], default: "Pending" },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
}, { timestamps: true });

const Expense = mongoose.model("Expense", expenseSchema);
export default Expense;
