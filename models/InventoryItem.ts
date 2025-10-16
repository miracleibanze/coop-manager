import mongoose, { Document, Model } from "mongoose";

export interface IInventoryHistory {
  _id?: string;
  before: number;
  after: number;
  reason: string;
  date: Date;
}

export interface IInventoryItem extends Document {
  _id: string;
  name: string;
  sku?: string;
  quantity: number;
  unit?: string;
  cost?: number;
  history: IInventoryHistory[];
  createdAt: Date;
  updatedAt: Date;
}

const InventoryHistorySchema = new mongoose.Schema<IInventoryHistory>({
  _id: { String },
  before: { type: Number, required: true },
  after: { type: Number, required: true },
  reason: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const InventoryItemSchema = new mongoose.Schema<IInventoryItem>(
  {
    name: { type: String, required: true },
    sku: String,
    quantity: { type: Number, default: 0 },
    unit: String,
    cost: Number,
    history: [InventoryHistorySchema],
  },
  { timestamps: true }
);

const InventoryItem: Model<IInventoryItem> =
  mongoose.models.InventoryItem ||
  mongoose.model<IInventoryItem>("InventoryItem", InventoryItemSchema);

export default InventoryItem;
