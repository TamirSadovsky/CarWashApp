'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { UserData } from '@/types';

type ChooseKind = 'cars' | 'phones';

export default function ChooseCarStep({
  kind = 'cars',
  items,
  onPick,
}: {
  kind?: ChooseKind;
  items: UserData[];
  onPick: (u: UserData) => void;
}) {
  type BookingInfo = { hasBooking: boolean; nextDate?: string | null };
  const [bookings, setBookings] = useState<Record<string, BookingInfo>>({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [errorMap, setErrorMap] = useState<Record<string, string | null>>({});

  const itemKeys = useMemo(
    () =>
      (items ?? []).map((c) => {
        const carNum = (c.CarNum ?? '').toString().trim();
        const carType = (c.CarType ?? '').toString().trim();
        const phone = (c.Phone ?? (c as any)?.PhoneN ?? '').toString().trim();

        // key should be unique for the chooser:
        // - cars: carNum|carType
        // - phones: carNum|carType|phone (same car, different phones)
        const key =
          kind === 'phones'
            ? `${carNum}|${carType}|${phone}`
            : `${carNum}|${carType}`;

        return { key, item: c };
      }),
    [items, kind]
  );

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const nextLoading: Record<string, boolean> = {};
      itemKeys.forEach(({ key }) => (nextLoading[key] = true));
      setLoadingMap(nextLoading);
      setErrorMap({});

      try {
        const results = await Promise.allSettled(
          itemKeys.map(async ({ key, item }) => {
            const carNum = String(item.CarNum ?? '').trim();
            const res = await fetch(
              `/api/car/check-appointments?carNum=${encodeURIComponent(carNum)}`
            );
            if (!res.ok) throw new Error('bad status');
            return { key, data: (await res.json()) as BookingInfo };
          })
        );

        if (cancelled) return;

        const nextBookings: Record<string, BookingInfo> = {};
        const nextLoading2: Record<string, boolean> = {};
        const nextErrors2: Record<string, string | null> = {};

        results.forEach((r, idx) => {
          const key = itemKeys[idx]?.key ?? `k${idx}`;
          nextLoading2[key] = false;

          if (r.status === 'fulfilled') {
            nextBookings[key] = {
              hasBooking: !!r.value.data?.hasBooking,
              nextDate: r.value.data?.nextDate ?? null,
            };
            nextErrors2[key] = null;
          } else {
            nextBookings[key] = { hasBooking: false, nextDate: null };
            nextErrors2[key] = 'שגיאה בבדיקת הזמנות';
          }
        });

        setBookings(nextBookings);
        setLoadingMap(nextLoading2);
        setErrorMap(nextErrors2);
      } catch {
        if (cancelled) return;

        const allNo: Record<string, BookingInfo> = {};
        const allDone: Record<string, boolean> = {};
        const allErr: Record<string, string | null> = {};

        itemKeys.forEach(({ key }) => {
          allNo[key] = { hasBooking: false, nextDate: null };
          allDone[key] = false;
          allErr[key] = 'שגיאה בבדיקת הזמנות';
        });

        setBookings(allNo);
        setLoadingMap(allDone);
        setErrorMap(allErr);
      }
    }

    if (itemKeys.length > 0) run();
    return () => {
      cancelled = true;
    };
  }, [itemKeys]);

  const fmtIL = (isoLike?: string | null) => {
    if (!isoLike) return '';
    const d = new Date(isoLike);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString('he-IL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const title =
    kind === 'phones'
      ? 'בחר טלפון להזמנת שטיפה'
      : 'בחר רכב להזמנת שטיפה';

  return (
    <div className="pb-1">
      <h2 className="mb-3 text-center text-[15px] font-bold text-slate-700">
        {title}
      </h2>

      <div className="space-y-3">
        {itemKeys.map(({ key, item }) => {
          const b = bookings[key];
          const isLoading = loadingMap[key];
          const err = errorMap[key];

          const carNum = (item.CarNum ?? '').toString().trim();
          const carType = (item.CarType ?? '').toString().trim() || '—';
          const customer =
            ((item as any)?.CostomerName ?? (item as any)?.CustomerName ?? '')
              .toString()
              .trim();

          const phone = (item.Phone ?? (item as any)?.PhoneN ?? '').toString().trim();

          return (
            <button
              key={key}
              onClick={() => onPick(item)}
              className="w-full rounded-2xl bg-white text-right ring-1 ring-slate-200 px-4 py-3
                         shadow-sm hover:bg-amber-50 transition"
            >
              {kind === 'phones' ? (
                <>
                  <div className="text-[17px] font-extrabold text-slate-800" dir="ltr">
                    {phone || '—'}
                  </div>
                  <div className="mt-1 text-xs text-slate-500" dir="rtl">
                    רכב:{' '}
                    <span className="font-semibold" dir="ltr">
                      {carNum || '—'}
                    </span>
                    {carType ? (
                      <>
                        {' · '}
                        {carType}
                      </>
                    ) : null}
                    {customer ? (
                      <>
                        {' · '}
                        {customer}
                      </>
                    ) : null}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-[17px] font-extrabold text-slate-800" dir="ltr">
                    {carNum || '—'}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {carType}
                    {customer ? (
                      <>
                        {' · '}
                        {customer}
                      </>
                    ) : null}
                    {phone ? (
                      <>
                        {' · '}
                        <span dir="ltr">{phone}</span>
                      </>
                    ) : null}
                  </div>
                </>
              )}

              <div className="mt-1 text-[12px]">
                {isLoading ? (
                  <span className="text-slate-400">בודק הזמנות...</span>
                ) : err ? (
                  <span className="text-amber-600">לא ניתן לבדוק כרגע</span>
                ) : b?.hasBooking ? (
                  <span className="text-emerald-700">
                    ✅ יש הזמנה עתידית {b.nextDate ? `(${fmtIL(b.nextDate)})` : ''}
                  </span>
                ) : (
                  <span className="text-slate-400">אין הזמנות עתידיות</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
