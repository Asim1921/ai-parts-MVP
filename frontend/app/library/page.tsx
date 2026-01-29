'use client';

import { useEffect, useState } from 'react';
import { api, Part } from '@/lib/api';
import { PartForm } from '@/components/PartForm';
import { BackgroundGradient } from '@/components/ui/background-gradient';

export default function LibraryPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Part | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const load = () => api.parts.list().then(setParts).finally(() => setLoading(false));

  const handleSeedTerremax = async () => {
    if (!confirm('Seed the Parts library from the TerreMax Camlock catalog? This adds parts that do not already exist.')) return;
    setSeeding(true);
    try {
      const res = await api.parts.seedTerremax();
      alert(`TerreMax catalog seeded: ${res.created} new parts added (${res.total} total in catalog).`);
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Seed failed');
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this part?')) return;
    await api.parts.delete(id);
    load();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Parts Library</h2>
          <p className="mt-1 text-slate-400">Manage part types and size variants</p>
        </div>
        <div className="flex gap-2">
          {/* <button
            type="button"
            onClick={handleSeedTerremax}
            disabled={seeding}
            className="btn-secondary"
          >
            {seeding ? 'Seeding…' : 'Seed TerreMax catalog'}
          </button> */}
          <button
            type="button"
            onClick={() => { setShowForm(true); setEditing(null); }}
            className="btn-primary"
          >
            Add Part
          </button>
        </div>
      </div>

      {(showForm || editing) && (
        <PartForm
          part={editing ?? undefined}
          onSave={async (body) => {
            if (editing) await api.parts.update(editing._id, body);
            else await api.parts.create(body);
            setShowForm(false);
            setEditing(null);
            load();
          }}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      {loading ? (
        <div className="text-slate-400">Loading...</div>
      ) : parts.length === 0 ? (
        <BackgroundGradient>
          <div className="card-base text-center py-12 text-slate-400">
            No parts yet. Add a part to get started.
          </div>
        </BackgroundGradient>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {parts.map((part) => (
            <BackgroundGradient key={part._id}>
              <div className="card-base p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-white">{part.name}</h3>
                    <p className="text-sm text-slate-400">{part.partId}</p>
                    {part.category && (
                      <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
                        {part.category}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditing(part)}
                      className="text-sm font-medium text-blue-400 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(part._id)}
                      className="text-sm font-medium text-red-400 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-600/50">
                  <p className="text-sm text-slate-500">
                    {part.sizeVariants?.length ?? 0} size variant(s)
                  </p>
                  {part.sizeVariants?.slice(0, 2).map((sv) => (
                    <p key={sv._id} className="text-xs text-slate-400 mt-0.5">
                      {sv.name} — ${sv.unitPrice.toFixed(2)}
                    </p>
                  ))}
                </div>
              </div>
            </BackgroundGradient>
          ))}
        </div>
      )}
    </div>
  );
}
