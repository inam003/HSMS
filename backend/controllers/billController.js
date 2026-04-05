import Bill from "../models/Bill.js";
import Payment from "../models/Payment.js";
import Unit from "../models/Unit.js";

export const getBills = async (req, res) => {
  const bills = await Bill.find().populate({ path: "unit", populate: { path: "resident", select: "Name Email" } });
  res.json(bills);
};

export const getMyBills = async (req, res) => {
  const unit = await Unit.findOne({ resident: req.user._id });
  if (!unit) return res.json([]);
  const bills = await Bill.find({ unit: unit._id });
  res.json(bills);
};

export const getBillById = async (req, res) => {
  const bill = await Bill.findById(req.params.id).populate("unit");
  if (!bill) return res.status(404).json({ message: "Bill not found" });
  res.json(bill);
};

export const createBill = async (req, res) => {
  const bill = await Bill.create(req.body);
  res.status(201).json(bill);
};

export const generateBills = async (req, res) => {
  const { Amount, Due_Date, Bill_Type } = req.body;
  const units = await Unit.find({ Status: "Occupied" });
  const bills = await Bill.insertMany(
    units.map((u) => ({ unit: u._id, Amount, Due_Date, Bill_Type, Status: "Unpaid" }))
  );
  res.status(201).json({ message: `${bills.length} bills generated`, bills });
};

export const updateBill = async (req, res) => {
  const bill = await Bill.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!bill) return res.status(404).json({ message: "Bill not found" });
  res.json(bill);
};

export const processPayment = async (req, res) => {
  const bill = await Bill.findById(req.params.id);
  if (!bill) return res.status(404).json({ message: "Bill not found" });
  if (bill.Status === "Paid") return res.status(400).json({ message: "Bill already paid" });

  // Dummy payment validation
  const { cardNumber, cardHolder, expiryDate, cvv, paymentMethod } = req.body;
  if (!cardNumber || !cardHolder) {
    return res.status(400).json({ message: "Payment failed: Invalid card details" });
  }

  bill.Status = "Paid";
  await bill.save();

  const payment = await Payment.create({
    bill: bill._id,
    Payment_Method: paymentMethod || "Card",
  });

  res.json({ message: "Payment successful", payment, bill });
};
