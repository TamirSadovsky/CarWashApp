'use client';
import React from 'react';
import { WorkItem } from '@/types';

export default function ServicesStep({
  options, selected, setSelected, loading, error, canAddMore,
}: {
  options: WorkItem[];
  selected: string[];
  setSelected: (v: string[]) => void;
  loading: boolean;
  error: string | null;
  canAddMore: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="text-[15px] font-extrabold text-slate-900/90">בחר שירותים</div>

      {loading && <div className="text-sm text-slate-500">טוען שירותים...</div>}
      {error && <div className="text-sm text-rose-600">{error}</div>}

      {selected.map((value, idx) => (
        <select
          key={idx}
          value={value}
          onChange={(e) => {
            const updated = [...selected];
            updated[idx] = e.target.value;
            setSelected(updated);
          }}
          disabled={loading || options.length === 0}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-right outline-none ring-2 ring-transparent focus:border-blue-300 focus:ring-blue-100 transition disabled:opacity-60"
        >
          <option value="">{loading ? 'טוען...' : 'בחר שירות...'}</option>
          {options
            .filter(w => !selected.includes(w.name) || selected[idx] === w.name)
            .map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
        </select>
      ))}

      {canAddMore && (
        <button
          type="button"
          onClick={() => setSelected([...selected, ''])}
          className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:underline"
        >
          <span>➕</span> הוסף שירות נוסף
        </button>
      )}
    </div>
  );
}
