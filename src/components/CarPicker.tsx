'use client';

import React from 'react';

export type CarUser = {
  CarNum?: string;
  DriverName?: string;
  CostomerName?: string;
  CarType?: string;
  Phone?: string;
};

type Props = {
  cars: CarUser[];
  onPick: (car: CarUser) => void;
  onCancel: () => void;
};

export default function CarPicker({ cars, onPick, onCancel }: Props) {
  return (
    <div className="space-y-4">
      <div className="text-[15px] font-extrabold text-slate-900/90">מצאנו כמה רכבים לטלפון הזה</div>

      <div className="rounded-2xl bg-white ring-1 ring-slate-200 p-3 space-y-2">
        {cars.map((c, i) => (
          <button
            key={(c.CarNum ?? '') + i}
            onClick={() => onPick(c)}
            className="w-full text-right rounded-xl border border-slate-200 p-3 hover:bg-slate-50 transition"
          >
            <div className="font-bold text-slate-900">{c.CarNum || '—'}</div>
            <div className="text-[12px] text-slate-600">
              {c.CarType || 'ללא סוג'}{c.DriverName ? ` • נהג: ${c.DriverName}` : ''}{c.CostomerName ? ` • לקוח: ${c.CostomerName}` : ''}
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 rounded-xl border border-slate-300 bg-white py-3 text-slate-700 hover:bg-slate-50"
        >
          חזור
        </button>
      </div>
    </div>
  );
}
