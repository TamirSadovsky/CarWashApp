'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import FancySelect from '@/components/ui/FancySelect';

export type RegState = {
  CostomerName: string;
  DriverName: string;
  carNum: string;
  TypeOfCar: string;
  phone: string;
};

export type RegisterSource = 'unknown' | 'phone' | 'car';

type Props = {
  reg: RegState;
  setReg: (v: RegState) => void;
  customerNames: string[];
  carTypes: string[];
  notFoundMsg?: string;
  registerSource?: RegisterSource;
  namesLoading?: boolean;
};

const FIELD =
  'w-full rounded-xl border bg-white px-4 py-3 outline-none appearance-none transition';
const OK =
  'border-slate-200 focus:border-yellow-300 focus:ring-2 focus:ring-yellow-100';

const CHIP_REQ =
  'rounded-full bg-slate-100 px-2 py-[2px] text-[11px] text-slate-700';

function norm(s: string) {
  return String(s ?? '')
    .trim()
    .toLowerCase();
}

function TypeaheadSelect({
  value,
  onPick,
  options,
  placeholder,
  disabled,
  required,
}: {
  value: string;
  onPick: (v: string) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState(value || '');

  useEffect(() => {
    setInput(value || '');
  }, [value]);

  useEffect(() => {
    const onDocDown = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocDown);
    return () => document.removeEventListener('mousedown', onDocDown);
  }, []);

  const filtered = useMemo(() => {
    const q = norm(input);
    if (!q) return options.slice(0, 80);
    const out = options.filter((o) => norm(o).includes(q));
    return out.slice(0, 80);
  }, [input, options]);

  return (
    <div ref={wrapRef} className="relative">
      <input
        type="text"
        value={input}
        disabled={disabled}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setInput(e.target.value);
          setOpen(true);
        }}
        placeholder={placeholder || 'הקלד כדי לחפש...'}
        className={`${FIELD} ${OK} ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
        aria-expanded={open}
        aria-autocomplete="list"
        autoComplete="off"
        required={required}
      />

      {open && !disabled && (
        <div className="absolute z-[9999] mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_60px_-20px_rgba(0,0,0,.25)]">
          <div className="max-h-64 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-500">אין תוצאות</div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onPick(opt);
                    setInput(opt);
                    setOpen(false);
                  }}
                  className="w-full text-right px-4 py-3 text-sm hover:bg-amber-50 focus:bg-amber-50 outline-none"
                >
                  {opt}
                </button>
              ))
            )}
          </div>

          <div className="border-t border-slate-100 px-4 py-2 text-[11px] text-slate-500">
            בחר מהרשימה
          </div>
        </div>
      )}
    </div>
  );
}

export default function RegisterStep({
  reg,
  setReg,
  customerNames,
  carTypes,
  notFoundMsg,
  registerSource = 'unknown',
  namesLoading = false,
}: Props) {
  const onlyDigits = (s: string) => s.replace(/\D/g, '');

  const [showInfo, setShowInfo] = useState(false);
  useEffect(() => setShowInfo(true), []);

  const isPhoneLocked = registerSource === 'phone';

  const customerOptions = useMemo(() => {
    return (customerNames ?? [])
      .map((x) => String(x ?? '').trim())
      .filter(Boolean);
  }, [customerNames]);

  const carTypeOptions = useMemo(() => {
    return (carTypes ?? [])
      .map((x) => String(x ?? '').trim())
      .filter(Boolean);
  }, [carTypes]);

  return (
    <div className="pb-2">
      {showInfo && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
          dir="rtl"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="סגירה"
            onClick={() => setShowInfo(false)}
          />

          <div className="relative w-full max-w-md rounded-3xl bg-white shadow-[0_20px_60px_-20px_rgba(0,0,0,.45)] ring-1 ring-slate-200">
            <div className="px-5 pt-5 pb-5">
              <div className="text-base font-bold text-slate-900">שימו לב</div>

              <div className="mt-3 rounded-2xl bg-sky-50 text-sky-900 ring-1 ring-sky-200 px-4 py-3 text-sm leading-relaxed">
                ניתן לבחור את שם החברה בהרשמה רק מתוך הרשימה שתיפתח.
                <br />
                במידה ושם החברה אינו קיים ברשימה - יש ליצור קשר עם שיין (רוסלן) להוספת החברה לרשימה או להירשם כלקוח מזדמן.
              </div>

              <button
                type="button"
                className="mt-4 w-full rounded-2xl bg-amber-500 py-3 font-semibold text-white shadow hover:bg-amber-600 shadow-[0_10px_30px_-10px_rgba(245,158,11,0.6)]"
                onClick={() => setShowInfo(false)}
                autoFocus
              >
                הבנתי
              </button>
            </div>
          </div>
        </div>
      )}

      {notFoundMsg && (
        <div className="mb-4 rounded-xl bg-amber-50 text-amber-800 ring-1 ring-amber-200 px-4 py-2 text-center text-sm">
          {notFoundMsg}
        </div>
      )}

      {/* שם לקוח - עם הקלדה */}
      <div className="mb-4">
        <label className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-600">
          <span>שם לקוח</span>
          <span className={CHIP_REQ}>חובה</span>
        </label>

        <TypeaheadSelect
          value={reg.CostomerName}
          onPick={(v) => setReg({ ...reg, CostomerName: v })}
          options={customerOptions}
          placeholder={namesLoading ? 'טוען שמות...' : 'בחר שם לקוח...'}
          disabled={namesLoading}
          required
        />

        {!namesLoading && customerOptions.length === 0 && (
          <div className="mt-2 text-xs text-slate-500">לא נטענו שמות לקוחות.</div>
        )}
      </div>

      {/* שם נהג */}
      <div className="mb-4">
        <label className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-600">
          <span>שם נהג</span>
          <span className={CHIP_REQ}>חובה</span>
        </label>
        <input
          type="text"
          value={reg.DriverName}
          onChange={(e) => setReg({ ...reg, DriverName: e.target.value })}
          placeholder="לדוגמה: דוד לוי"
          className={`${FIELD} ${OK}`}
          required
        />
      </div>

      {/* מספר רכב */}
      <div className="mb-4">
        <label className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-600">
          <span>מספר רכב</span>
          <span className={CHIP_REQ}>חובה</span>
        </label>
        <input
          type="text"
          dir="ltr"
          inputMode="numeric"
          maxLength={8}
          pattern="\d{6,8}"
          value={reg.carNum}
          onChange={(e) =>
            setReg({
              ...reg,
              carNum: e.target.value.replace(/\D/g, '').slice(0, 8),
            })
          }
          placeholder="לדוגמה: 9876543"
          className={`${FIELD} ${OK} text-left`}
          required
        />
      </div>

      {/* סוג רכב - בדיוק כמו קודם */}
      <div className="mb-4">
        <label className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-600">
          <span>סוג רכב</span>
          <span className={CHIP_REQ}>חובה</span>
        </label>

        <FancySelect
          value={reg.TypeOfCar}
          onChange={(v) => setReg({ ...reg, TypeOfCar: v })}
          options={carTypeOptions}
          placeholder="בחר סוג רכב..."
        />
      </div>

      {/* טלפון */}
      <div className="mb-1">
        <label className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-600">
          <span>טלפון</span>
          <span className={CHIP_REQ}>חובה</span>
        </label>
        <input
          id="phone"
          type="tel"
          name="phone"
          dir="ltr"
          inputMode="numeric"
          pattern="0\d{8,9}"
          maxLength={10}
          placeholder="לדוגמה: 0501234567"
          value={reg.phone}
          readOnly={isPhoneLocked}
          onChange={(e) => {
            if (isPhoneLocked) return;
            setReg({ ...reg, phone: onlyDigits(e.target.value).slice(0, 10) });
          }}
          className={`${FIELD} ${OK} text-left ${isPhoneLocked ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          required
        />
      </div>
    </div>
  );
}
