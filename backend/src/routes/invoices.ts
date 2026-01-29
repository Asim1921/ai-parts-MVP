import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Invoice } from '../models/Invoice';
import { ScanSession } from '../models/ScanSession';
import { Part } from '../models/Part';
import { Inventory } from '../models/Inventory';

export const invoicesRouter = Router();

invoicesRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 }).lean();
    res.json(invoices);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

invoicesRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const invoice = await Invoice.findOne({
      $or: [{ invoiceId: req.params.id }, { _id: req.params.id }],
    }).lean();
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

invoicesRouter.post('/', async (req: Request, res: Response) => {
  try {
    const lineItems = req.body.lineItems || [];
    let grandTotal = 0;
    const items = lineItems.map((item: { partId: string; sizeVariantId: string; partName: string; sizeName: string; quantity: number; unitPrice: number }) => {
      const total = item.quantity * item.unitPrice;
      grandTotal += total;
      return { ...item, total };
    });
    const invoice = await Invoice.create({
      invoiceId: `inv-${uuidv4().slice(0, 8)}`,
      sessionId: req.body.sessionId,
      lineItems: items,
      grandTotal,
    });
    for (const item of items) {
      await Inventory.findOneAndUpdate(
        { partId: item.partId, sizeVariantId: item.sizeVariantId },
        { $inc: { quantityOnHand: -item.quantity }, lastUpdated: new Date() },
        { upsert: false }
      );
    }
    res.status(201).json(invoice);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

invoicesRouter.post('/from-scan/:sessionId', async (req: Request, res: Response) => {
  try {
    const session = await ScanSession.findOne({ sessionId: req.params.sessionId }).lean();
    if (!session) return res.status(404).json({ error: 'Session not found' });
    const recognized = (session.detections || []).filter((d) => d.recognized && d.partId && d.sizeVariantId);
    const byKey: Record<string, { partId: string; sizeVariantId: string; quantity: number }> = {};
    for (const d of recognized) {
      const key = `${d.partId!}:${d.sizeVariantId!}`;
      if (!byKey[key]) byKey[key] = { partId: d.partId!, sizeVariantId: d.sizeVariantId!, quantity: 0 };
      byKey[key].quantity++;
    }
    const parts = await Part.find({ partId: { $in: [...new Set(Object.values(byKey).map((x) => x.partId))] } }).lean();
    const partMap = new Map(parts.map((p) => [p.partId, p]));
    const lineItems = Object.values(byKey).map((x) => {
      const part = partMap.get(x.partId);
      const variant = part?.sizeVariants?.find((v) => String(v._id) === x.sizeVariantId);
      const unitPrice = variant?.unitPrice ?? 0;
      const total = x.quantity * unitPrice;
      return {
        partId: x.partId,
        sizeVariantId: x.sizeVariantId,
        partName: part?.name ?? '',
        sizeName: variant?.name ?? '',
        quantity: x.quantity,
        unitPrice,
        total,
      };
    });
    const grandTotal = lineItems.reduce((s, i) => s + i.total, 0);
    const invoice = await Invoice.create({
      invoiceId: `inv-${uuidv4().slice(0, 8)}`,
      sessionId: session.sessionId,
      lineItems,
      grandTotal,
    });
    for (const item of lineItems) {
      await Inventory.findOneAndUpdate(
        { partId: item.partId, sizeVariantId: item.sizeVariantId },
        { $inc: { quantityOnHand: -item.quantity }, lastUpdated: new Date() },
        { upsert: false }
      );
    }
    await ScanSession.updateOne({ sessionId: req.params.sessionId }, { status: 'converted_to_invoice' });
    res.status(201).json(invoice);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});
