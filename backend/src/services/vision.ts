import { IDetection } from '../models/Detection';
import { v4 as uuidv4 } from 'uuid';
import { analyzeImageWithOpenAI } from './openai-vision';
import { Part } from '../models/Part';

const VISION_URL = process.env.VISION_SERVICE_URL;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
export const CONFIDENCE_THRESHOLD = 0.7;

async function resolveSizeVariantIds(detections: IDetection[]): Promise<IDetection[]> {
  const partIds = [...new Set(detections.map((d) => d.partId).filter(Boolean))] as string[];
  if (partIds.length === 0) return detections;
  const parts = await Part.find({ partId: { $in: partIds } }).lean();
  const partMap = new Map(parts.map((p) => [p.partId, p]));
  return detections.map((d) => {
    if (!d.partId || d.sizeVariantId) return d;
    const part = partMap.get(d.partId);
    const firstVariant = part?.sizeVariants?.[0];
    const sizeVariantId = firstVariant ? String(firstVariant._id) : undefined;
    return { ...d, sizeVariantId };
  });
}

export async function analyzeImage(imagePath: string): Promise<IDetection[]> {
  if (OPENAI_API_KEY) {
    try {
      const detections = await analyzeImageWithOpenAI(imagePath);
      return resolveSizeVariantIds(detections);
    } catch (e) {
      console.warn('OpenAI vision failed, falling back to stub:', (e as Error).message);
    }
  }
  if (VISION_URL) {
    try {
      const res = await fetch(`${VISION_URL}/health`);
      if (res.ok) return getStubDetections();
    } catch (_e) {
      console.warn('Vision service unavailable, using stub');
    }
  }
  return getStubDetections();
}

function getStubDetections(): IDetection[] {
  return [
    {
      detectionId: uuidv4(),
      imageIndex: 0,
      boundingBox: { x: 50, y: 60, w: 120, h: 90 },
      recognized: true,
      partId: 'stub-part-1',
      sizeVariantId: 'stub-size-1',
      confidence: 0.95,
    },
    {
      detectionId: uuidv4(),
      imageIndex: 0,
      boundingBox: { x: 220, y: 80, w: 100, h: 85 },
      recognized: false,
      confidence: 0.3,
      guidance: 'rotate',
    },
  ];
}
