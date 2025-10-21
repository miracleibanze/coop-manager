// models/Member.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IMember extends Document {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: "member" | "admin";
  cooperativeId: mongoose.Types.ObjectId;
  joinDate: Date;
  status: "active" | "inactive";
  contributionPlan: number;
  totalContributions: number;
  createdAt: Date;
  updatedAt: Date;
}

const MemberSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    role: { type: String, enum: ["member", "admin"], default: "member" },
    cooperativeId: {
      type: Schema.Types.ObjectId,
      ref: "Cooperative",
      required: true,
    },
    joinDate: { type: Date, default: Date.now },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    contributionPlan: { type: Number, required: true },
    totalContributions: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Member ||
  mongoose.model<IMember>("Member", MemberSchema);
