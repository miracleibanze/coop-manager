// models/Activity.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IActivity extends Document {
  type:
    | "contribution"
    | "loan_application"
    | "loan_approval"
    | "loan_repayment"
    | "expense";
  member: mongoose.Types.ObjectId;
  amount?: number;
  description: string;
  date: Date;
  status?: string;
  createdAt: Date;
}

const ActivitySchema: Schema = new Schema(
  {
    type: {
      type: String,
      enum: [
        "contribution",
        "loan_application",
        "loan_approval",
        "loan_repayment",
        "expense",
      ],
      required: true,
    },
    member: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    amount: { type: Number },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    status: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Activity ||
  mongoose.model<IActivity>("Activity", ActivitySchema);
