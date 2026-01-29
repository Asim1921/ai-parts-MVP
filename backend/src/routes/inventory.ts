import { Router, Request, Response } from 'express';
import { Inventory } from '../models/Inventory';
import { Part } from '../models/Part';

export const inventoryRouter = Router();

inventoryRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const items = await Inventory.find().lean();
    const parts = await Part.find().lean();
    const partMap = new Map(parts.map((p) => [p.partId, p]));
    const enriched = items.map((inv) => {
      const part = partMap.get(inv.partId);
      const variant = part?.sizeVariants?.find((v) => String(v._id) === inv.sizeVariantId);
      return {
        ...inv,
        partName: part?.name,
        sizeName: variant?.name,
        unitPrice: variant?.unitPrice,
      };
    });
    res.json(enriched);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

inventoryRouter.patch('/', async (req: Request, res: Response) => {
  try {
    const { partId, sizeVariantId, quantityOnHand } = req.body;
    if (!partId || !sizeVariantId) return res.status(400).json({ error: 'partId and sizeVariantId required' });
    const inv = await Inventory.findOneAndUpdate(
      { partId, sizeVariantId },
      { quantityOnHand: Number(quantityOnHand) ?? 0, lastUpdated: new Date() },
      { new: true, upsert: true }
    );
    res.json(inv);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});
