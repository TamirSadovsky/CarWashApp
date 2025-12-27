'use client';

import React, { useMemo, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { LocationItem } from '@/types';

/* utils */
const pad2 = (n: number) => String(n).padStart(2, '0');
const toISODate = (d: Date) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const roundUpToStep = (date: Date, stepMin = 15) => {
  const d = new Date(date);
  d.setSeconds(0, 0);
  const rem = d.getMinutes() % stepMin;
  if (rem !== 0) d.setMinutes(d.getMinutes() + (stepMin - rem));
  return d;
};

type Props = {
  locations: LocationItem[];
  loading: boolean;
  error: string | null;

  selectedLocationId: number | null;
  setSelectedLocationId: (v: number | null) => void;

  selectedDateISO: string;
  setSelectedDateISO: (v: string) => void;

  selectedTime: string;
  setSelectedTime: (v: string) => void;
};

export default function LocationTimeStep({
  locations,
  loading,
  error,
  selectedLocationId,
  setSelectedLocationId,
  selectedDateISO,
  setSelectedDateISO,
  selectedTime,
  setSelectedTime,
}: Props) {
  const todayStart = (() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  })();

  const selectedDateObj = (() => {
    if (!selectedDateISO) return todayStart;
    const d = new Date(selectedDateISO + 'T00:00:00');
    return isNaN(d.getTime()) ? todayStart : d;
  })();

  // 07:00–17:00 every 15 min
  const allTimes = useMemo(() => {
    const list: string[] = [];
    for (let h = 7; h <= 17; h++) {
      for (let m = 0; m < 60; m += 15) list.push(`${pad2(h)}:${pad2(m)}`);
    }
    return list;
  }, []);

  // hide past times if today
  const visibleTimes = useMemo(() => {
    const isToday =
      selectedDateObj.getFullYear() === todayStart.getFullYear() &&
      selectedDateObj.getMonth() === todayStart.getMonth() &&
      selectedDateObj.getDate() === todayStart.getDate();

    if (!isToday) return allTimes;

    const nowRounded = roundUpToStep(new Date(), 15);
    const barrier = `${pad2(nowRounded.getHours())}:${pad2(nowRounded.getMinutes())}`;
    return allTimes.filter((t) => t >= barrier);
  }, [allTimes, selectedDateObj, todayStart]);

  useEffect(() => {
    if (!selectedTime && visibleTimes.length) {
      setSelectedTime(visibleTimes[0]);
      return;
    }
    if (selectedTime && visibleTimes.length && !visibleTimes.includes(selectedTime)) {
      setSelectedTime(visibleTimes[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleTimes.join(',')]);

  // 🔒 אחידות סגנון לכל השדות
  const FIELD =
    'block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none';
  const LABEL = 'mb-1 block text-xs font-semibold text-slate-600';

  return (
    <div className="space-y-4">
      {/* מיקום */}
      <div>
        <label className={LABEL}>מיקום</label>
        <select
          className={FIELD}
          value={selectedLocationId ?? ''}
          onChange={(e) => setSelectedLocationId(e.target.value ? Number(e.target.value) : null)}
          disabled={loading || !!error}
        >
          <option value="">בחר מיקום…</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
      </div>

      {/* תאריך */}
      <div>
        <label className={LABEL}>תאריך</label>
        <DatePicker
          selected={selectedDateObj}
          onChange={(d: Date | null) => {
            const safe = d ?? todayStart;
            safe.setHours(0, 0, 0, 0);
            setSelectedDateISO(toISODate(safe));
          }}
          dateFormat="dd/MM/yyyy"
          minDate={todayStart}       // ❌ אין בחירת עבר
          calendarStartDay={0}
          showPopperArrow={false}
          isClearable={false}
          className={FIELD}          // 👈 ה־input עצמו
          wrapperClassName="block w-full" // 👈 גם ה־wrapper ברוחב מלא
        />
      </div>

      {/* שעה */}
      <div>
        <label className={LABEL}>שעה</label>
        <select
          className={FIELD}
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
        >
          {visibleTimes.length === 0 ? (
            <option value="">אין זמינות היום</option>
          ) : (
            visibleTimes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))
          )}
        </select>
      </div>
    </div>
  );
}
