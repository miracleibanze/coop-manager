// models/Cooperative.ts
import mongoose, { Document, Model } from "mongoose";

export interface ICooperative extends Document {
  _id: string;
  name: string;
  description: string;
  managerId: mongoose.Types.ObjectId;
  location: string;
  contactEmail: string;
  contactPhone: string;
  joinCode: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CooperativeSchema = new mongoose.Schema<ICooperative>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    location: { type: String, required: true },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, required: true },
    joinCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Cooperative: Model<ICooperative> =
  mongoose.models.Cooperative ||
  mongoose.model<ICooperative>("Cooperative", CooperativeSchema);

export default Cooperative;
