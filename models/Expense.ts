// models/Expense.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IExpense extends Document {
  category: "office" | "operations" | "maintenance" | "other";
  amount: number;
  date: Date;
  description?: string;
  receipt?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema: Schema = new Schema(
  {
    category: {
      type: String,
      enum: ["office", "operations", "maintenance", "other"],
      required: true,
    },
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    description: { type: String },
    receipt: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "Member", required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Expense ||
  mongoose.model<IExpense>("Expense", ExpenseSchema);
