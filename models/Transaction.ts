import mongoose, { Document, Model, Types } from "mongoose";

export interface ITransaction extends Document {
  _id: string;
  type: "contribution" | "transfer" | "expense" | "sale";
  amount: number;
  fromMember?: Types.ObjectId;
  toMember?: Types.ObjectId;
  note?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new mongoose.Schema<ITransaction>(
  {
    type: {
      type: String,
      enum: ["contribution", "transfer", "expense", "sale"],
      required: true,
    },
    amount: { type: Number, required: true },
    fromMember: { type: mongoose.Schema.Types.ObjectId, ref: "Member" },
    toMember: { type: mongoose.Schema.Types.ObjectId, ref: "Member" },
    note: String,
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Transaction: Model<ITransaction> =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", TransactionSchema);
export default Transaction;
