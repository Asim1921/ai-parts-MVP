import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { Part } from '../models/Part';
import { Inventory } from '../models/Inventory';
import { v4 as uuidv4 } from 'uuid';

export const partsRouter = Router();

partsRouter.post('/seed-terremax', async (_req: Request, res: Response) => {
  try {
    const dataPath = path.join(__dirname, '../data/terremax-catalog.json');
    const raw = fs.readFileSync(dataPath, 'utf-8');
    const catalog = JSON.parse(raw) as Array<{ partId: string; name: string; series: string }>;
    let created = 0;
    for (const entry of catalog) {
      const existing = await Part.findOne({ partId: entry.partId });
      if (existing) continue;
      const part = await Part.create({
        name: entry.name,
        partId: entry.partId,
        category: entry.series,
        description: `TerreMax Camlock - ${entry.series}`,
        sizeVariants: [{ name: entry.partId, unitPrice: 0 }],
      });
      for (const sv of part.sizeVariants) {
        await Inventory.findOneAndUpdate(
          { partId: part.partId, sizeVariantId: String(sv._id) },
          { $setOnInsert: { partId: part.partId, sizeVariantId: String(sv._id), quantityOnHand: 0 } },
          { upsert: true }
        );
      }
      created++;
    }
    res.json({ ok: true, created, total: catalog.length });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

partsRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const parts = await Part.find().sort({ createdAt: -1 }).lean();
    res.json(parts);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

partsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const part = await Part.findOne({ $or: [{ _id: req.params.id }, { partId: req.params.id }] }).lean();
    if (!part) return res.status(404).json({ error: 'Part not found' });
    res.json(part);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

partsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const partId = req.body.partId || `part-${uuidv4().slice(0, 8)}`;
    const part = await Part.create({
      name: req.body.name,
      partId,
      category: req.body.category,
      description: req.body.description,
      sizeVariants: req.body.sizeVariants || [],
    });
    for (const sv of part.sizeVariants) {
      await Inventory.findOneAndUpdate(
        { partId: part.partId, sizeVariantId: String(sv._id) },
        { $setOnInsert: { partId: part.partId, sizeVariantId: String(sv._id), quantityOnHand: 0 } },
        { upsert: true }
      );
    }
    res.status(201).json(part);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

partsRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const part = await Part.findOneAndUpdate(
      { $or: [{ _id: req.params.id }, { partId: req.params.id }] },
      {
        name: req.body.name,
        category: req.body.category,
        description: req.body.description,
        sizeVariants: req.body.sizeVariants,
      },
      { new: true }
    );
    if (!part) return res.status(404).json({ error: 'Part not found' });
    res.json(part);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

partsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const part = await Part.findOneAndDelete({ $or: [{ _id: req.params.id }, { partId: req.params.id }] });
    if (!part) return res.status(404).json({ error: 'Part not found' });
    await Inventory.deleteMany({ partId: part.partId });
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});
