// models/Role.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IRole extends Document {
  name: string;
  cooperativeId: mongoose.Types.ObjectId;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    cooperativeId: {
      type: Schema.Types.ObjectId,
      ref: "Cooperative",
      required: true,
    },
    permissions: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.models.Role ||
  mongoose.model<IRole>("Role", RoleSchema);
