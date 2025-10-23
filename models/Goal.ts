import mongoose, { Document, Model } from "mongoose";

export interface IGoal extends Document {
  _id: string;
  title: string;
  description?: string;
  cooperativeId: mongoose.Types.ObjectId;
  targetNumber: number;
  currentNumber: number;
  dueDate?: Date;
  status: "open" | "closed";
  createdAt: Date;
  updatedAt: Date;
}

const GoalSchema = new mongoose.Schema<IGoal>(
  {
    title: { type: String, required: true },
    description: String,
    cooperativeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cooperative",
      required: true,
    },
    targetNumber: { type: Number, required: true },
    currentNumber: { type: Number, default: 0 },
    dueDate: Date,
    status: { type: String, enum: ["open", "closed"], default: "open" },
  },
  { timestamps: true }
);

const Goal: Model<IGoal> =
  mongoose.models.Goal || mongoose.model<IGoal>("Goal", GoalSchema);
export default Goal;
