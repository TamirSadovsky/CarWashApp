import React, { useState, useRef, useEffect } from 'react';

type SimpleSelectProps = {
  label?: string;
  value: string;
  onChange: (next: string) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
  hint?: string;
  dir?: 'rtl' | 'ltr';
};

export default function SimpleSelect({
  label,
  value,
  onChange,
  options,
  placeholder = 'בחר…',
  disabled,
  hint,
  dir = 'rtl',
}: SimpleSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full" dir={dir} ref={ref}>
      {label && (
        <label className="mb-1 block text-xs font-semibold text-slate-600">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-base text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none flex justify-between items-center"
          onClick={() => !disabled && setOpen((o) => !o)}
          disabled={disabled}
        >
          {value || placeholder}
          <span className="ml-2 text-slate-400">▼</span>
        </button>
        {open && (
          <ul className="absolute left-0 right-0 mt-1 z-10 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-auto">
            {options.map(opt => (
              <li
                key={opt}
                className={`px-3 py-2 cursor-pointer hover:bg-slate-100 ${opt === value ? 'bg-slate-200' : ''}`}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
              >
                {opt}
              </li>
            ))}
          </ul>
        )}
      </div>
      {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
    </div>
  );
}
