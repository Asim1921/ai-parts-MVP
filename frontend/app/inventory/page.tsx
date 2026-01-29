'use client';

import { useEffect, useState } from 'react';
import { api, InventoryItem } from '@/lib/api';
import { BackgroundGradient } from '@/components/ui/background-gradient';

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [adjust, setAdjust] = useState<{ key: string; qty: number } | null>(null);

  const load = () => api.inventory.list().then(setItems).finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const handleAdjust = async (partId: string, sizeVariantId: string, quantityOnHand: number) => {
    const key = `${partId}:${sizeVariantId}`;
    setUpdating(key);
    try {
      await api.inventory.update({ partId, sizeVariantId, quantityOnHand });
      setAdjust(null);
      load();
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight">Inventory</h2>
        <p className="mt-1 text-slate-400">View and adjust stock levels</p>
      </div>

      {loading ? (
        <div className="text-slate-400">Loading...</div>
      ) : items.length === 0 ? (
        <BackgroundGradient>
          <div className="card-base py-12 text-center text-slate-400">
            No inventory records. Add parts in the library and run scans or adjust here.
          </div>
        </BackgroundGradient>
      ) : (
        <BackgroundGradient>
          <div className="card-base overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-600/50 bg-slate-900/50">
                    <th className="px-4 py-3 font-semibold text-white">Part</th>
                    <th className="px-4 py-3 font-semibold text-white">Size</th>
                    <th className="px-4 py-3 font-semibold text-white">Unit price</th>
                    <th className="px-4 py-3 font-semibold text-white">Quantity</th>
                    <th className="px-4 py-3 font-semibold text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const key = `${item.partId}:${item.sizeVariantId}`;
                    const isEditing = adjust?.key === key;
                    return (
                      <tr key={item._id} className="border-b border-slate-700/30 hover:bg-slate-800/30">
                        <td className="px-4 py-3 text-slate-200">{item.partName ?? item.partId}</td>
                        <td className="px-4 py-3 text-slate-400">{item.sizeName ?? item.sizeVariantId}</td>
                        <td className="px-4 py-3 text-slate-400">
                          {item.unitPrice != null ? `$${item.unitPrice.toFixed(2)}` : '—'}
                        </td>
                        <td className="px-4 py-3 font-medium text-white">{item.quantityOnHand}</td>
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <div className="flex gap-2 items-center">
                              <input
                                type="number"
                                min="0"
                                value={adjust?.qty ?? item.quantityOnHand}
                                onChange={(e) => setAdjust({ key, qty: Number(e.target.value) })}
                                className="input-field w-24"
                              />
                              <button
                                type="button"
                                disabled={updating === key}
                                onClick={() => handleAdjust(item.partId, item.sizeVariantId, adjust?.qty ?? item.quantityOnHand)}
                                className="btn-primary text-sm py-1.5 px-3"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setAdjust(null)}
                                className="text-sm text-slate-400 hover:underline"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setAdjust({ key, qty: item.quantityOnHand })}
                              className="text-sm font-medium text-blue-400 hover:underline"
                            >
                              Adjust
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </BackgroundGradient>
      )}
    </div>
  );
}
