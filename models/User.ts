import mongoose, { Document, Model } from "mongoose";

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  about: string;
  role: "admin" | "manager";
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    about: { type: String },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "manager"], default: "manager" },
  },
  { timestamps: true }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
