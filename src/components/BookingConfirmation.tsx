'use client';

import React from 'react';

type CarData = {
  CarNum?: string;
  CarType?: string;
  DriverName?: string;
  // שדות נוספים אם יש: CostomerName?: string; Phone?: string;
};

type LocationData = {
  name: string;
  address?: string; // אופציונלי — לא מחייב שמגיע מה־DB
};

type BookingConfirmationProps = {
  carData: CarData;
  services: [string, ...string[]];
  location: LocationData;
  date: string;
  time: string;
  onConfirm: () => void;
};

export default function BookingConfirmation({
  carData,
  services,
  location,
  date,
  time,
  onConfirm,
}: BookingConfirmationProps) {
  const formatServices = Array.isArray(services) ? services.join(', ') : '';

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow-md rounded-lg text-right text-sm" style={{ overflow: 'visible', height: 'auto' }}>
      <h2 className="text-xl font-bold mb-4 text-center">שלב אישור והשלמה</h2>

      <p className="mb-2 text-gray-700 font-semibold">תקציר ההזמנה:</p>

      <div className="border rounded-md p-4 mb-4 bg-gray-50">
        {carData.CarNum && (
          <div>
            <span className="font-bold">מספר רכב:</span> {carData.CarNum}
          </div>
        )}
        {carData.CarType && (
          <div>
            <span className="font-bold">סוג רכב:</span> {carData.CarType}
          </div>
        )}
        {carData.DriverName && (
          <div>
            <span className="font-bold">שם נהג:</span> {carData.DriverName}
          </div>
        )}
        <div>
          <span className="font-bold">שירותים:</span> {formatServices}
        </div>
        <div>
          <span className="font-bold">מכון:</span>{' '}
          {location.name}
          {location.address ? ` - ${location.address}` : ''}
        </div>
        <div>
          <span className="font-bold">תאריך:</span> {date}
        </div>
        <div>
          <span className="font-bold">שעה:</span> {time}
        </div>
      </div>

      <button
        onClick={onConfirm}
        className="w-full rounded-2xl bg-amber-500 py-3 font-semibold text-white 
             shadow hover:bg-amber-600 
             shadow-[0_10px_30px_-10px_rgba(245,158,11,0.6)] 
             transition"
      >
        סיום והזמן
      </button>

    </div>
  );
}
