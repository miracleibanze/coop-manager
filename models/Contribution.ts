// models/Contribution.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IContribution extends Document {
  member: mongoose.Types.ObjectId;
  amount: number;
  date: Date;
  paymentMethod: "cash" | "mobile_money" | "bank_transfer";
  status: "pending" | "approved" | "rejected";
  receipt?: string;
  approvedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ContributionSchema: Schema = new Schema(
  {
    member: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    paymentMethod: {
      type: String,
      enum: ["cash", "mobile_money", "bank_transfer"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    receipt: { type: String },
    approvedBy: { type: Schema.Types.ObjectId, ref: "Member" },
  },
  { timestamps: true }
);

export default mongoose.models.Contribution ||
  mongoose.model<IContribution>("Contribution", ContributionSchema);
