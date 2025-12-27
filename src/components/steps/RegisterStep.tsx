'use client';

import React, { useEffect, useState } from 'react';
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
};

const FIELD =
  'w-full rounded-xl border bg-white px-4 py-3 outline-none appearance-none transition';
const OK = 'border-slate-200 focus:border-yellow-300 focus:ring-2 focus:ring-yellow-100';

export default function RegisterStep({
  reg,
  setReg,
  customerNames,
  carTypes,
  notFoundMsg,
  registerSource = 'unknown',
}: Props) {
  const set = <K extends keyof RegState>(k: K, v: RegState[K]) =>
    setReg({ ...reg, [k]: v });

  const onlyDigits = (s: string) => s.replace(/\D/g, '');

  // show popup once when entering this page
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    setShowInfo(true);
  }, []);

  const isCarLocked = registerSource === 'car';
  const isPhoneLocked = registerSource === 'phone';

  return (
    <div className="pb-2">
      {/* Popup on enter */}
      {showInfo && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
          dir="rtl"
          role="dialog"
          aria-modal="true"
        >
          {/* overlay (click to close) */}
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="סגירה"
            onClick={() => setShowInfo(false)}
          />

          {/* modal */}
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

      {/* small notice (why we’re here) */}
      {notFoundMsg && (
        <div className="mb-4 rounded-xl bg-amber-50 text-amber-800 ring-1 ring-amber-200 px-4 py-2 text-center text-sm">
          {notFoundMsg}
        </div>
      )}

      {/* keep popovers above the card and avoid clipping */}
      <style>{`.rs__menu-portal{z-index:9999 !important;}`}</style>

      {/* שם לקוח */}
      <div className="mb-4">
        <label className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-600">
          <span>שם לקוח</span>
          <span className="rounded-full bg-slate-100 px-2 py-[2px] text-[11px] text-slate-700">
            חובה
          </span>
        </label>
        <select
          value={reg.CostomerName}
          onChange={(e) => set('CostomerName', e.target.value)}
          className={`${FIELD} ${OK}`}
          required
        >
          <option value="" disabled>
            בחר שם לקוח…
          </option>

          {customerNames.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      {/* שם נהג */}
      <div className="mb-4">
        <label className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-600">
          <span>שם נהג</span>
          <span className="rounded-full bg-slate-100 px-2 py-[2px] text-[11px] text-slate-700">
            חובה
          </span>
        </label>
        <input
          type="text"
          value={reg.DriverName}
          onChange={(e) => set('DriverName', e.target.value)}
          placeholder="לדוגמה: דוד לוי"
          className={`${FIELD} ${OK}`}
          required
        />
      </div>

      {/* מספר רכב */}
      <div className="mb-4">
        <label className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-600">
          <span>מספר רכב</span>
          <span className="rounded-full bg-slate-100 px-2 py-[2px] text-[11px] text-slate-700">
            חובה
          </span>
        </label>
        <input
          type="text"
          dir="ltr"
          inputMode="numeric"
          maxLength={8}
          pattern="\d{6,8}"
          value={reg.carNum}
          readOnly={isCarLocked}
          onChange={(e) => {
            if (isCarLocked) return;
            set('carNum', e.target.value.replace(/\D/g, '').slice(0, 8));
          }}
          placeholder="9876543"
          className={`${FIELD} ${OK} text-left ${isCarLocked ? 'opacity-70 cursor-not-allowed' : ''}`}
          required
        />
      </div>

      {/* סוג רכב */}
      <div className="mb-2">
        <label className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-600">
          <span>סוג רכב</span>
          <span className="rounded-full bg-slate-100 px-2 py-[2px] text-[11px] text-slate-700">
            חובה
          </span>
        </label>

        <FancySelect
          value={reg.TypeOfCar}
          onChange={(v) => set('TypeOfCar', v)}
          options={carTypes}
          placeholder="בחר סוג רכב…"
        />
      </div>

      {/* טלפון */}
      <div className="mb-3">
        <label className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-600">
          <span>טלפון</span>
          <span className="rounded-full bg-slate-100 px-2 py-[2px] text-[11px] text-slate-700">
            חובה
          </span>
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
            set('phone', onlyDigits(e.target.value).slice(0, 10));
          }}
          className={`${FIELD} ${OK} text-left ${isPhoneLocked ? 'opacity-70 cursor-not-allowed' : ''}`}
          required
        />
      </div>
    </div>
  );
}
