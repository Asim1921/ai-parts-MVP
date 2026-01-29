const API_BASE =
  typeof window !== 'undefined'
    ? '/api-backend'
    : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error || res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  health: () => request<{ ok: boolean }>('/health'),
  parts: {
    list: () => request<Part[]>('/parts'),
    get: (id: string) => request<Part>(`/parts/${id}`),
    create: (body: Partial<Part>) => request<Part>('/parts', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: Partial<Part>) => request<Part>(`/parts/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id: string) => request<void>(`/parts/${id}`, { method: 'DELETE' }),
    seedTerremax: () => request<{ ok: boolean; created: number; total: number }>('/parts/seed-terremax', { method: 'POST' }),
  },
  scan: {
    upload: (formData: FormData) => {
      const url = `${API_BASE}/scan/upload`;
      return fetch(url, { method: 'POST', body: formData }).then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: res.statusText }));
          throw new Error((err as { error?: string }).error || res.statusText);
        }
        return res.json() as Promise<ScanSession>;
      });
    },
    sessions: () => request<ScanSession[]>('/scan/sessions'),
    getSession: (id: string) => request<ScanSession>(`/scan/sessions/${id}`),
    updateSession: (id: string, body: { status?: string; detections?: Detection[] }) =>
      request<ScanSession>(`/scan/sessions/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  },
  inventory: {
    list: () => request<InventoryItem[]>('/inventory'),
    update: (body: { partId: string; sizeVariantId: string; quantityOnHand: number }) =>
      request<InventoryItem>('/inventory', { method: 'PATCH', body: JSON.stringify(body) }),
  },
  invoices: {
    list: () => request<Invoice[]>(`/invoices`),
    get: (id: string) => request<Invoice>(`/invoices/${id}`),
    create: (body: { lineItems: InvoiceLineItem[]; sessionId?: string }) =>
      request<Invoice>('/invoices', { method: 'POST', body: JSON.stringify(body) }),
    fromScan: (sessionId: string) =>
      request<Invoice>(`/invoices/from-scan/${sessionId}`, { method: 'POST' }),
  },
};

export interface Part {
  _id: string;
  name: string;
  partId: string;
  category?: string;
  description?: string;
  sizeVariants: SizeVariant[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SizeVariant {
  _id: string;
  name: string;
  dimensions?: { widthMm?: number; heightMm?: number; depthMm?: number };
  unitPrice: number;
  referenceImageUrls?: string[];
}

export interface Detection {
  detectionId: string;
  imageIndex: number;
  boundingBox: { x: number; y: number; w: number; h: number };
  recognized: boolean;
  partId?: string;
  sizeVariantId?: string;
  confidence: number;
  guidance?: string;
}

export interface ScanSession {
  _id: string;
  sessionId: string;
  imageUrls: string[];
  detections: Detection[];
  status: 'draft' | 'resolved' | 'converted_to_invoice';
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryItem {
  _id: string;
  partId: string;
  sizeVariantId: string;
  quantityOnHand: number;
  partName?: string;
  sizeName?: string;
  unitPrice?: number;
  lastUpdated?: string;
}

export interface InvoiceLineItem {
  partId: string;
  sizeVariantId: string;
  partName: string;
  sizeName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  _id: string;
  invoiceId: string;
  sessionId?: string;
  lineItems: InvoiceLineItem[];
  grandTotal: number;
  createdAt?: string;
  updatedAt?: string;
}
