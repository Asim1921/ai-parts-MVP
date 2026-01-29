'use client';

import { useState } from 'react';
import { Part, SizeVariant } from '@/lib/api';
import { BackgroundGradient } from '@/components/ui/background-gradient';

type FormPart = Omit<Part, '_id' | 'createdAt' | 'updatedAt' | 'partId'> & { _id?: string; partId?: string };

export function PartForm({
  part,
  onSave,
  onCancel,
}: {
  part?: Part;
  onSave: (body: FormPart) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(part?.name ?? '');
  const [partId, setPartId] = useState(part?.partId ?? '');
  const [category, setCategory] = useState(part?.category ?? '');
  const [description, setDescription] = useState(part?.description ?? '');
  const [sizeVariants, setSizeVariants] = useState<SizeVariant[]>(part?.sizeVariants ?? []);
  const [saving, setSaving] = useState(false);

  const addVariant = () => {
    setSizeVariants((v) => [
      ...v,
      { _id: `new-${Date.now()}`, name: '', unitPrice: 0 },
    ]);
  };

  const updateVariant = (index: number, field: keyof SizeVariant, value: string | number) => {
    setSizeVariants((v) => {
      const next = [...v];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const removeVariant = (index: number) => {
    setSizeVariants((v) => v.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        name,
        ...(partId ? { partId } : {}),
        category: category || undefined,
        description: description || undefined,
        sizeVariants: sizeVariants.map((sv) => ({
          ...sv,
          name: sv.name,
          unitPrice: Number(sv.unitPrice),
        })),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <BackgroundGradient containerClassName="max-w-2xl">
      <div className="card-base p-6 max-w-2xl">
        <h3 className="text-lg font-semibold text-white mb-4">
          {part ? 'Edit Part' : 'New Part'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Part ID (optional)</label>
          <input
            type="text"
            value={partId}
            onChange={(e) => setPartId(e.target.value)}
            className="input-field"
            placeholder="Auto-generated if empty"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-field min-h-[80px]"
            rows={3}
          />
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-slate-300">Size variants</label>
            <button type="button" onClick={addVariant} className="text-sm font-medium text-blue-400 hover:underline">
              + Add variant
            </button>
          </div>
          <div className="space-y-2">
            {sizeVariants.map((sv, i) => (
              <div key={sv._id} className="flex gap-2 items-center flex-wrap">
                <input
                  type="text"
                  value={sv.name}
                  onChange={(e) => updateVariant(i, 'name', e.target.value)}
                  className="input-field flex-1 min-w-[120px]"
                  placeholder="Variant name"
                />
                <input
                  type="number"
                  step="0.01"
                  value={sv.unitPrice ?? ''}
                  onChange={(e) => updateVariant(i, 'unitPrice', e.target.value)}
                  className="input-field w-24"
                  placeholder="Price"
                />
                <button type="button" onClick={() => removeVariant(i)} className="text-red-400 text-sm">
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
      </div>
    </BackgroundGradient>
  );
}
