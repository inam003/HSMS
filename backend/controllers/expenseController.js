import Expense from "../models/Expense.js";

export const getExpenses = async (req, res) => {
  const expenses = await Expense.find().populate("admin", "Name");
  res.json(expenses);
};

export const createExpense = async (req, res) => {
  const expense = await Expense.create({ ...req.body, admin: req.user._id });
  res.status(201).json(expense);
};

export const updateExpense = async (req, res) => {
  const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!expense) return res.status(404).json({ message: "Expense not found" });
  res.json(expense);
};

export const deleteExpense = async (req, res) => {
  await Expense.findByIdAndDelete(req.params.id);
  res.json({ message: "Expense deleted" });
};

export const getReports = async (req, res) => {
  const { type } = req.query;

  if (type === "defaulters") {
    const Bill = (await import("../models/Bill.js")).default;
    const defaulters = await Bill.find({ Status: "Unpaid" })
      .populate({ path: "unit", populate: { path: "resident", select: "Name Email Contact_No" } })
      .sort({ Due_Date: 1 });
    return res.json(defaulters);
  }

  if (type === "income-expense") {
    const Bill = (await import("../models/Bill.js")).default;
    const paidBills = await Bill.find({ Status: "Paid" });
    const totalIncome = paidBills.reduce((sum, b) => sum + b.Amount, 0);
    const expenses = await Expense.find();
    const totalExpenses = expenses.reduce((sum, e) => sum + e.Amount, 0);
    return res.json({ totalIncome, totalExpenses, balance: totalIncome - totalExpenses, paidBills, expenses });
  }

  res.status(400).json({ message: "Invalid report type. Use: defaulters or income-expense" });
};
