// models/User.ts (important update)
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: false, // Not required for Google users
    },
    image: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      default: "manager",
      enum: ["manager", "admin"],
    },
    provider: {
      type: String,
      required: true,
      default: "credentials",
      enum: ["credentials", "google", "both"],
    },
    emailVerified: {
      type: Date,
      required: false,
    },
    lastLoginAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
