import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { IDetection } from '../models/Detection';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const CONFIDENCE_THRESHOLD = 0.7;

type CatalogEntry = { partId: string; name: string; series: string };

let catalogCache: CatalogEntry[] | null = null;

function getCatalog(): CatalogEntry[] {
  if (catalogCache) return catalogCache;
  try {
    const dataPath = path.join(__dirname, '../data/terremax-catalog.json');
    const raw = fs.readFileSync(dataPath, 'utf-8');
    catalogCache = JSON.parse(raw) as CatalogEntry[];
    return catalogCache!;
  } catch {
    catalogCache = [];
    return [];
  }
}

function buildCatalogPrompt(): string {
  const catalog = getCatalog();
  if (!catalog.length) return 'No catalog loaded. Any part visible in the image should be reported as unrecognized with guidance "retake".';
  const lines = catalog.slice(0, 80).map((e) => `- ${e.partId}: ${e.name} (${e.series})`);
  return `Reference catalog (TerreMax Camlock fittings). Match visible parts to these part IDs when possible:\n${lines.join('\n')}\n(More parts exist in the full catalog; if a part matches a known type/size pattern above, use that partId. Otherwise report unrecognized.)`;
}

interface OpenAIDetection {
  partId?: string | null;
  confidence?: number;
  guidance?: string;
  bbox?: { x: number; y: number; w: number; h: number };
}

function parseDetectionsFromContent(content: string, imageWidth: number, imageHeight: number): IDetection[] {
  const detections: IDetection[] = [];
  try {
    const parsed = JSON.parse(content) as { detections?: OpenAIDetection[] } | OpenAIDetection[];
    const list = Array.isArray(parsed) ? parsed : (parsed.detections ?? []);
    if (!Array.isArray(list)) return detections;
    list.forEach((d: OpenAIDetection, index: number) => {
      const partId = d.partId ?? null;
      const recognized = Boolean(partId && (d.confidence ?? 0) >= CONFIDENCE_THRESHOLD);
      const confidence = Math.min(1, Math.max(0, Number(d.confidence) ?? 0));
      let bbox = d.bbox;
      if (!bbox || typeof bbox.x !== 'number') {
        const row = Math.floor(index / 3);
        const col = index % 3;
        const w = Math.floor(imageWidth / 3);
        const h = Math.floor(imageHeight / 4);
        bbox = { x: col * w, y: row * h, w, h };
      }
      detections.push({
        detectionId: uuidv4(),
        imageIndex: 0,
        boundingBox: { x: bbox.x, y: bbox.y, w: bbox.w, h: bbox.h },
        recognized,
        partId: recognized ? partId! : undefined,
        sizeVariantId: recognized ? partId! : undefined,
        confidence,
        guidance: recognized ? undefined : (d.guidance || 'retake'),
      });
    });
  } catch (_e) {
    // ignore parse errors
  }
  return detections;
}

export async function analyzeImageWithOpenAI(imagePath: string): Promise<IDetection[]> {
  if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not set');
  const client = new OpenAI({ apiKey: OPENAI_API_KEY });
  const imageBuffer = fs.readFileSync(imagePath);
  const base64 = imageBuffer.toString('base64');
  const ext = path.extname(imagePath).toLowerCase();
  const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
  const dataUrl = `data:${mime};base64,${base64}`;
  const catalogPrompt = buildCatalogPrompt();
  const systemPrompt = `You are an expert at identifying industrial fluid fittings (camlock couplings, TerreMax-style parts) in photos. You analyze images and return a JSON object with a single key "detections" whose value is an array of objects. Each object must have:
- partId: string or null. Use the exact catalog partId (e.g. 100A, 200B) if the part clearly matches; otherwise null.
- confidence: number between 0 and 1 (how sure you are).
- guidance: string only when partId is null or confidence < 0.7. One of: "retake", "rotate", "flip" to suggest how to improve the image.
- bbox (optional): { x, y, w, h } in pixels from top-left, or as percentages 0-100 of image width/height. Approximate the region where each part appears.

Rules:
- List EVERY distinct part visible in the image. Do not skip any.
- If you cannot identify a part, set partId to null and give guidance (e.g. "rotate" if it needs a better angle).
- Recognized parts must have partId from the catalog and confidence >= 0.7.
- Return only valid JSON, no markdown or extra text.`;

  const userPrompt = `${catalogPrompt}

Analyze this image of parts (possibly on a mat or surface). List each part you see. For each part, identify it with the catalog partId if it clearly matches a TerreMax camlock type/size; otherwise set partId to null and provide guidance. If the image has no parts or is unclear, return {"detections":[]} or a single detection with partId null and guidance "retake".`;

  const response = await client.chat.completions.create({
    model: process.env.OPENAI_VISION_MODEL || 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [
          { type: 'text', text: userPrompt },
          { type: 'image_url', image_url: { url: dataUrl } },
        ],
      },
    ],
    max_tokens: 4096,
    response_format: { type: 'json_object' },
  });
  const content = response.choices[0]?.message?.content;
  if (!content) return [];
  const imageWidth = 800;
  const imageHeight = 600;
  return parseDetectionsFromContent(content, imageWidth, imageHeight);
}

export { CONFIDENCE_THRESHOLD };
