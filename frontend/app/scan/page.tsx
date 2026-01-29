'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api, ScanSession, Detection } from '@/lib/api';
import { BackgroundGradient } from '@/components/ui/background-gradient';

const CONFIDENCE_THRESHOLD = 0.7;

function ScanImageWithBoxes({
  url,
  alt,
  detections,
}: {
  url: string;
  alt: string;
  detections: Detection[];
}) {
  const [dim, setDim] = useState<{ w: number; h: number } | null>(null);
  return (
    <div className="relative rounded-xl overflow-hidden border-2 border-slate-600/50 bg-slate-900/50">
      <img
        src={url}
        alt={alt}
        className="w-full h-auto block"
        onLoad={(e) => {
          const img = e.currentTarget;
          setDim({ w: img.naturalWidth, h: img.naturalHeight });
        }}
      />
      {dim &&
        detections.map((d) => {
          const { x, y, w, h } = d.boundingBox;
          const left = (x / dim.w) * 100;
          const top = (y / dim.h) * 100;
          const width = (w / dim.w) * 100;
          const height = (h / dim.h) * 100;
          return (
            <div
              key={d.detectionId}
              className="absolute border-2 border-red-500 bg-red-500/20 pointer-events-none"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: `${width}%`,
                height: `${height}%`,
              }}
            >
              {d.guidance && (
                <span className="absolute -top-6 left-0 text-xs font-medium text-red-300 bg-slate-900/95 px-1 rounded whitespace-nowrap">
                  {d.guidance}
                </span>
              )}
            </div>
          );
        })}
    </div>
  );
}

function shouldBox(d: Detection): boolean {
  return !d.recognized || d.confidence < CONFIDENCE_THRESHOLD;
}

export default function ScanPage() {
  const [uploading, setUploading] = useState(false);
  const [session, setSession] = useState<ScanSession | null>(null);
  const [sessions, setSessions] = useState<ScanSession[]>([]);
  const [listView, setListView] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSessions = () => api.scan.sessions().then(setSessions);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setError(null);
    setUploading(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) formData.append('images', files[i]);
    try {
      const s = await api.scan.upload(formData);
      setSession(s);
      setListView(false);
      loadSessions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const recognized = (session?.detections ?? []).filter((d) => d.recognized && d.confidence >= CONFIDENCE_THRESHOLD);
  const unresolved = (session?.detections ?? []).filter(shouldBox);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Scan</h2>
          <p className="mt-1 text-slate-400">Upload images for part recognition</p>
        </div>
        <div className="flex gap-2">
          <label className="btn-primary cursor-pointer">
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
            {uploading ? 'Processing...' : 'Upload images'}
          </label>
          <button
            type="button"
            onClick={() => { setSession(null); setListView(true); }}
            className="btn-secondary"
          >
            Sessions
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border-2 border-red-500/50 bg-red-950/50 px-4 py-3 text-red-300">
          {error}
        </div>
      )}

      {listView && !session && (
        <div className="space-y-4">
          <p className="text-slate-400">Recent scan sessions</p>
          <button
            type="button"
            onClick={loadSessions}
            className="text-sm font-medium text-blue-400 hover:underline"
          >
            Refresh list
          </button>
          {sessions.length === 0 ? (
            <div className="card-base py-12 text-center text-slate-400">
              No sessions yet. Upload images to start a scan.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sessions.map((s) => (
                <div
                  key={s.sessionId}
                  className="card-base cursor-pointer hover:border-blue-500/40"
                  onClick={() => { setSession(s); setListView(false); }}
                >
                  <p className="font-medium text-white">{s.sessionId}</p>
                  <p className="text-sm text-slate-400">{s.imageUrls?.length ?? 0} image(s)</p>
                  <p className="text-xs text-blue-400 mt-1 capitalize">{s.status}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {session && !listView && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-4 items-center">
            <span className="font-medium text-white">{session.sessionId}</span>
            <span className="px-2 py-1 rounded text-sm bg-blue-500/20 text-blue-400 capitalize">
              {session.status}
            </span>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-semibold text-white">Scan result</h3>
              {session.imageUrls?.map((url, idx) => (
                <ScanImageWithBoxes
                  key={idx}
                  url={url}
                  alt={`Scan ${idx + 1}`}
                  detections={(session.detections ?? []).filter(
                    (d) => d.imageIndex === idx && shouldBox(d)
                  )}
                />
              ))}
            </div>

            <div className="space-y-6">
              <BackgroundGradient>
                <div className="card-base p-6">
                  <h3 className="font-semibold text-white mb-3">Recognized parts (not boxed)</h3>
                  {recognized.length === 0 ? (
                    <p className="text-slate-400 text-sm">None</p>
                  ) : (
                    <ul className="space-y-1 text-sm text-slate-300">
                      {recognized.map((d) => (
                        <li key={d.detectionId}>
                          Part {d.partId} / {d.sizeVariantId} ({(d.confidence * 100).toFixed(0)}%)
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </BackgroundGradient>
              <BackgroundGradient containerClassName="border border-red-500/30">
                <div className="card-base p-6">
                  <h3 className="font-semibold text-white mb-3">Unrecognized / low confidence (boxed)</h3>
                  {unresolved.length === 0 ? (
                    <p className="text-slate-400 text-sm">None — all parts identified</p>
                  ) : (
                    <ul className="space-y-2 text-sm">
                      {unresolved.map((d) => (
                        <li key={d.detectionId} className="flex flex-wrap items-center gap-2 text-slate-300">
                          <span>Confidence {(d.confidence * 100).toFixed(0)}%</span>
                          {d.guidance && (
                            <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400">
                              {d.guidance}
                            </span>
                          )}
                          <span className="text-slate-500">— Re-scan or add to library</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </BackgroundGradient>
              {session.status === 'draft' && (
                <div className="flex gap-2">
                  <Link
                    href={`/invoices?fromScan=${session.sessionId}`}
                    className="btn-primary"
                  >
                    Generate invoice from scan
                  </Link>
                  <Link href="/library" className="btn-secondary">
                    Add part to library
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
