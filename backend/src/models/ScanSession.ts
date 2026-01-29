import mongoose, { Schema, Document, Model } from 'mongoose';
import { IDetection } from './Detection';

export type ScanStatus = 'draft' | 'resolved' | 'converted_to_invoice';

export interface IScanSession extends Document {
  sessionId: string;
  imageUrls: string[];
  detections: IDetection[];
  status: ScanStatus;
  createdAt: Date;
  updatedAt: Date;
}

const DetectionSchema = new Schema(
  {
    detectionId: { type: String, required: true },
    imageIndex: { type: Number, required: true },
    boundingBox: {
      x: Number,
      y: Number,
      w: Number,
      h: Number,
    },
    recognized: { type: Boolean, required: true },
    partId: String,
    sizeVariantId: String,
    confidence: { type: Number, required: true },
    guidance: String,
  },
  { _id: false }
);

const ScanSessionSchema = new Schema<IScanSession>(
  {
    sessionId: { type: String, required: true, unique: true },
    imageUrls: [String],
    detections: [DetectionSchema],
    status: { type: String, enum: ['draft', 'resolved', 'converted_to_invoice'], default: 'draft' },
  },
  { timestamps: true }
);

export const ScanSession: Model<IScanSession> =
  mongoose.models.ScanSession || mongoose.model<IScanSession>('ScanSession', ScanSessionSchema);
