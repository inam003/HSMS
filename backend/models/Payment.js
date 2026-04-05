import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  bill: { type: mongoose.Schema.Types.ObjectId, ref: "Bill", required: true, unique: true },
  Transaction_Date: { type: Date, default: Date.now },
  Payment_Method: { type: String, default: "Card" },
  Transaction_Ref_No: { type: String, unique: true },
}, { timestamps: true });

paymentSchema.pre("save", function () {
  if (!this.Transaction_Ref_No) {
    const rand = Math.random().toString(36).substr(2, 6).toUpperCase();
    this.Transaction_Ref_No = `TXN-${Date.now()}-${rand}`;
  }
});

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
