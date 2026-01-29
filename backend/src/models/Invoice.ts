import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInvoiceLineItem {
  partId: string;
  sizeVariantId: string;
  partName: string;
  sizeName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface IInvoice extends Document {
  invoiceId: string;
  sessionId?: string;
  lineItems: IInvoiceLineItem[];
  grandTotal: number;
  createdAt: Date;
  updatedAt: Date;
}

const LineItemSchema = new Schema(
  {
    partId: String,
    sizeVariantId: String,
    partName: String,
    sizeName: String,
    quantity: Number,
    unitPrice: Number,
    total: Number,
  },
  { _id: false }
);

const InvoiceSchema = new Schema<IInvoice>(
  {
    invoiceId: { type: String, required: true, unique: true },
    sessionId: String,
    lineItems: [LineItemSchema],
    grandTotal: { type: Number, required: true },
  },
  { timestamps: true }
);

export const Invoice: Model<IInvoice> =
  mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);
