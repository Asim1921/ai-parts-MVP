import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISizeVariant {
  _id?: mongoose.Types.ObjectId;
  name: string;
  dimensions?: { widthMm?: number; heightMm?: number; depthMm?: number };
  unitPrice: number;
  referenceImageUrls?: string[];
}

export interface IPart extends Document {
  name: string;
  partId: string;
  category?: string;
  description?: string;
  sizeVariants: ISizeVariant[];
  createdAt: Date;
  updatedAt: Date;
}

const SizeVariantSchema = new Schema<ISizeVariant>({
  name: { type: String, required: true },
  dimensions: {
    widthMm: Number,
    heightMm: Number,
    depthMm: Number,
  },
  unitPrice: { type: Number, required: true },
  referenceImageUrls: [String],
});

const PartSchema = new Schema<IPart>(
  {
    name: { type: String, required: true },
    partId: { type: String, required: true, unique: true },
    category: String,
    description: String,
    sizeVariants: [SizeVariantSchema],
  },
  { timestamps: true }
);

export const Part: Model<IPart> = mongoose.models.Part || mongoose.model<IPart>('Part', PartSchema);
