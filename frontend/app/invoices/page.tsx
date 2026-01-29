'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, Invoice, ScanSession } from '@/lib/api';
import { BackgroundGradient } from '@/components/ui/background-gradient';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [sessions, setSessions] = useState<ScanSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromScanId, setFromScanId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const load = () =>
    Promise.all([api.invoices.list().then(setInvoices), api.scan.sessions().then(setSessions)]);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const id = params.get('fromScan');
    if (id) setFromScanId(id);
  }, []);

  const createFromScan = async (sessionId: string) => {
    setCreating(true);
    try {
      await api.invoices.fromScan(sessionId);
      setFromScanId(null);
      load();
    } finally {
      setCreating(false);
    }
  };

  const draftSessions = sessions.filter((s) => s.status === 'draft' || s.status === 'resolved');

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight">Invoices</h2>
        <p className="mt-1 text-slate-400">Create and view invoices</p>
      </div>

      {fromScanId && (
        <BackgroundGradient containerClassName="border border-blue-500/30">
          <div className="card-base p-6">
            <h3 className="font-semibold text-white mb-2">Generate invoice from scan</h3>
            <p className="text-sm text-slate-400 mb-3">Session: {fromScanId}</p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={creating}
                onClick={() => createFromScan(fromScanId)}
                className="btn-primary"
              >
                {creating ? 'Creating...' : 'Generate invoice'}
              </button>
              <button
                type="button"
                onClick={() => setFromScanId(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </BackgroundGradient>
      )}

      {draftSessions.length > 0 && !fromScanId && (
        <BackgroundGradient>
          <div className="card-base p-6">
            <h3 className="font-semibold text-white mb-2">Create from scan session</h3>
            <div className="flex flex-wrap gap-2">
              {draftSessions.map((s) => (
                <Link
                  key={s.sessionId}
                  href={`/invoices?fromScan=${s.sessionId}`}
                  className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 font-medium hover:bg-blue-500/30"
                >
                  {s.sessionId}
                </Link>
              ))}
            </div>
          </div>
        </BackgroundGradient>
      )}

      {loading ? (
        <div className="text-slate-400">Loading...</div>
      ) : invoices.length === 0 ? (
        <BackgroundGradient>
          <div className="card-base py-12 text-center text-slate-400">
            No invoices yet. Generate from a scan or create manually.
          </div>
        </BackgroundGradient>
      ) : (
        <div className="space-y-4">
          {invoices.map((inv) => (
            <BackgroundGradient key={inv._id}>
              <div className="card-base p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-white">{inv.invoiceId}</h3>
                    {inv.sessionId && (
                      <p className="text-sm text-slate-400">From scan: {inv.sessionId}</p>
                    )}
                    <p className="text-xs text-slate-500 mt-1">
                      {inv.createdAt ? new Date(inv.createdAt).toLocaleString() : ''}
                    </p>
                  </div>
                  <p className="text-xl font-bold text-blue-400">${inv.grandTotal.toFixed(2)}</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-600/50 text-slate-400">
                        <th className="py-2 text-left">Part</th>
                        <th className="py-2 text-left">Size</th>
                        <th className="py-2 text-right">Qty</th>
                        <th className="py-2 text-right">Unit</th>
                        <th className="py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inv.lineItems?.map((line, i) => (
                        <tr key={i} className="border-b border-slate-700/30">
                          <td className="py-2 text-slate-200">{line.partName}</td>
                          <td className="py-2 text-slate-400">{line.sizeName}</td>
                          <td className="py-2 text-right text-slate-300">{line.quantity}</td>
                          <td className="py-2 text-right text-slate-400">${line.unitPrice.toFixed(2)}</td>
                          <td className="py-2 text-right font-medium text-white">${line.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </BackgroundGradient>
          ))}
        </div>
      )}
    </div>
  );
}
