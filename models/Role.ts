// models/Role.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IRole extends Document {
  name: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    permissions: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.models.Role ||
  mongoose.model<IRole>("Role", RoleSchema);
