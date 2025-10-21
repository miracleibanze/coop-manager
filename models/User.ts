import mongoose, { Document, Model } from "mongoose";

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  about: string;
  role: "admin" | "manager";
  passwordHash?: string; // Make optional for OAuth users
  emailVerified?: Date;
  image?: string;
  provider: "credentials" | "google" | "both";
  cooperativeId?: mongoose.Types.ObjectId; // Reference to the cooperative
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    about: { type: String },
    passwordHash: { type: String }, // Make optional
    role: { type: String, enum: ["admin", "manager"], default: "manager" },
    emailVerified: { type: Date },
    image: { type: String },
    provider: {
      type: String,
      enum: ["credentials", "google", "both"],
      default: "credentials",
    },
    cooperativeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cooperative",
      default: null,
    },
    lastLoginAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
