'use client';

import React from 'react';

type Props = {
  value: string;
  setValue: (v: string) => void;
  onSubmit: () => void;
  error: string | null;
  setError: (v: string | null) => void;
  rememberMe: boolean;
  setRememberMe: (v: boolean) => void;
  savedHint?: string | null;
  onUseSaved?: () => void;
  rememberAlign?: 'right' | 'left';
};

export default function InputStep({
  value,
  setValue,
  onSubmit,
  error,
  setError,
  rememberMe,
  setRememberMe,
  savedHint,
  onUseSaved,
  rememberAlign = 'left',
}: Props) {
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    if (error) setError(null);
  };

  const rememberRow =
    rememberAlign === 'right' ? (
      // RTL line: checkbox on the RIGHT, label on its LEFT
      <div className="mt-3 flex items-center justify-start" dir="rtl">
        <input
          id="rememberMe"
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="ml-2 h-4 w-4 accent-amber-500"
        />
        <label htmlFor="rememberMe" className="text-sm text-slate-700 select-none cursor-pointer">
          זכור אותי
        </label>
      </div>
    ) : (
      // default (LTR-like) layout
      <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="h-4 w-4 accent-amber-500"
        />
        זכור אותי
      </label>
    );

  return (
    <div className="space-y-3">
      {savedHint && (
        <button
          type="button"
          onClick={onUseSaved}
          className="rounded-full bg-amber-50 text-amber-800 ring-1 ring-amber-200 px-4 py-1.5 text-sm"
        >
          נמצא פריט שמור: {savedHint}
        </button>
      )}

      <label className="block text-center text-slate-700 font-medium">מספר טלפון או מספר רכב</label>

      <input
        value={value}
        onChange={(e) => {
          // allow only digits
          const digitsOnly = e.target.value.replace(/\D/g, '');
          setValue(digitsOnly);
        }}
        placeholder="הכנס כאן"
        type="text"
        inputMode="numeric"   // mobile keyboards show digits
        pattern="[0-9]*"      // browser validation
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none ring-2 ring-transparent focus:border-blue-300 focus:ring-blue-100"
      />


      {error && <div className="text-right text-red-600 text-sm">{error}</div>}

      {rememberRow}
    </div>
  );
}
