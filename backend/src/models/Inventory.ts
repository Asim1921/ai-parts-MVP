import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInventory extends Document {
  partId: string;
  sizeVariantId: string;
  quantityOnHand: number;
  lastUpdated: Date;
}

const InventorySchema = new Schema<IInventory>(
  {
    partId: { type: String, required: true },
    sizeVariantId: { type: String, required: true },
    quantityOnHand: { type: Number, required: true, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

InventorySchema.index({ partId: 1, sizeVariantId: 1 }, { unique: true });

export const Inventory: Model<IInventory> =
  mongoose.models.Inventory || mongoose.model<IInventory>('Inventory', InventorySchema);
