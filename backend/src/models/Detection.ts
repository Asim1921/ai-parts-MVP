export interface BoundingBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface IDetection {
  detectionId: string;
  imageIndex: number;
  boundingBox: BoundingBox;
  recognized: boolean;
  partId?: string;
  sizeVariantId?: string;
  confidence: number;
  guidance?: string;
}
