// models/Loan.ts
import mongoose, { Document, Schema } from "mongoose";

export interface ILoan extends Document {
  member: mongoose.Types.ObjectId;
  cooperativeId: mongoose.Types.ObjectId;
  requestedAmount: number;
  approvedAmount?: number;
  reason: string;
  status:
    | "pending"
    | "approved"
    | "rejected"
    | "active"
    | "completed"
    | "defaulted";
  interestRate: number;
  startDate?: Date;
  dueDate?: Date;
  amountRepaid: number;
  approvedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LoanSchema: Schema = new Schema(
  {
    member: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    cooperativeId: {
      type: Schema.Types.ObjectId,
      ref: "Cooperative",
      required: true,
    },
    requestedAmount: { type: Number, required: true },
    approvedAmount: { type: Number },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "active",
        "completed",
        "defaulted",
      ],
      default: "pending",
    },
    interestRate: { type: Number, default: 0.1 }, // 10% default
    startDate: { type: Date },
    dueDate: { type: Date },
    amountRepaid: { type: Number, default: 0 },
    approvedBy: { type: Schema.Types.ObjectId, ref: "Member" },
  },
  { timestamps: true }
);

export default mongoose.models.Loan ||
  mongoose.model<ILoan>("Loan", LoanSchema);
