'use client';

import React from 'react';
import { LocationItem, UserData } from '@/types';

type ConfirmStepProps = {
  user: UserData;
  services: string[];
  location?: LocationItem;
  dateISO: string;
  time: string;
  /** optional – BusinessLogin handles the actual submit in its footer */
  onBooked?: () => void;
};

export default function ConfirmStep({
  user,
  services,
  location,
  dateISO,
  time,
  onBooked, // optional; not required here
}: ConfirmStepProps) {
  const serviceText = services.filter(Boolean).join(', ') || '—';

  return (
    <div className="space-y-5">
      <div className="text-right text-slate-800 font-semibold">אישור והשלמה</div>

      <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 shadow-sm text-sm">
        <div className="grid grid-cols-2 gap-y-2 gap-x-6">
          <div className="text-slate-500">רכב</div>
          <div className="font-medium">{user.CarNum || '—'}</div>

          <div className="text-slate-500">שירותים</div>
          <div className="font-medium">{serviceText}</div>

          <div className="text-slate-500">מיקום</div>
          <div className="font-medium">{location?.name || '—'}</div>

          <div className="text-slate-500">תאריך</div>
          <div className="font-medium">{dateISO || '—'}</div>

          <div className="text-slate-500">שעה</div>
          <div className="font-medium">{time || '—'}</div>
        </div>
      </div>

      <div className="text-xs text-slate-500">
        ודא שהפרטים נכונים ואז לחץ על <b>סיום והזמן</b> למטה.
      </div>

    </div>
  );
}
