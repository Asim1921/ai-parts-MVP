import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { ScanSession } from '../models/ScanSession';
import { analyzeImage } from '../services/vision';

const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname) || '.jpg'}`),
});
const upload = multer({ storage });

export const scanRouter = Router();

scanRouter.post('/upload', upload.array('images', 10), async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files?.length) return res.status(400).json({ error: 'No images uploaded' });
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const imageUrls = files.map((f) => `${baseUrl}/uploads/${f.filename}`);
    const sessionId = `scan-${uuidv4().slice(0, 8)}`;
    const allDetections: Array<{
      detectionId: string;
      imageIndex: number;
      boundingBox: { x: number; y: number; w: number; h: number };
      recognized: boolean;
      partId?: string;
      sizeVariantId?: string;
      confidence: number;
      guidance?: string;
    }> = [];
    let imageIndex = 0;
    for (const file of files) {
      const detections = await analyzeImage(file.path);
      for (const d of detections) {
        allDetections.push({
          ...d,
          imageIndex,
        });
      }
      imageIndex++;
    }
    const session = await ScanSession.create({
      sessionId,
      imageUrls,
      detections: allDetections,
      status: 'draft',
    });
    res.status(201).json(session);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

scanRouter.get('/sessions', async (_req: Request, res: Response) => {
  try {
    const sessions = await ScanSession.find().sort({ createdAt: -1 }).lean();
    res.json(sessions);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

scanRouter.get('/sessions/:id', async (req: Request, res: Response) => {
  try {
    const session = await ScanSession.findOne({
      $or: [{ sessionId: req.params.id }, { _id: req.params.id }],
    }).lean();
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

scanRouter.patch('/sessions/:id', async (req: Request, res: Response) => {
  try {
    const session = await ScanSession.findOneAndUpdate(
      { $or: [{ sessionId: req.params.id }, { _id: req.params.id }] },
      { status: req.body.status, detections: req.body.detections },
      { new: true }
    );
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});
