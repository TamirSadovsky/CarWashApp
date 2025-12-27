'use client';

import React, { useState } from 'react';

type Location = {
  id: number;
  name: string;
  address: string;
  hours: string[];
};

type SelectionResult = Location & {
  selectedDate: string;
  selectedTime: string;
};

type LocationSelectionProps = {
  onSelectionComplete: (data: SelectionResult) => void;
};

const mockLocations: Location[] = [
  { id: 1, name: 'תל אביב - יפו', address: 'רחוב הרצל 10', hours: ['08:00', '09:00', '10:00'] },
  { id: 2, name: 'חולון', address: 'שד-ירושלים 22', hours: ['09:00', '11:00', '13:00'] },
  { id: 3, name: 'פתח תקווה', address: 'רחוב המכבים 5', hours: ['07:00', '08:30', '10:30'] },
];

export default function LocationSelection({ onSelectionComplete }: LocationSelectionProps) {
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  const selectedLocation = mockLocations.find((loc) => loc.id === selectedLocationId || undefined);

  const handleContinue = () => {
    if (selectedLocation && selectedDate && selectedTime) {
      onSelectionComplete({
        ...selectedLocation,
        selectedDate,
        selectedTime,
      });
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow-md rounded-lg text-right text-sm">
      <h2 className="text-xl font-bold mb-4 text-center">בחר מיקום, תאריך ושעה</h2>

      {/* מיקום */}
      <select
        value={selectedLocationId ?? ''}
        onChange={(e) => {
          const v = e.target.value;
          setSelectedLocationId(v ? parseInt(v, 10) : null);
          setSelectedTime('');
        }}
        className="w-full border rounded-md px-3 py-2 mb-4 text-right"
      >
        <option value="">בחר מיקום...</option>
        {mockLocations.map((loc) => (
          <option key={loc.id} value={loc.id}>
            {loc.name} - {loc.address}
          </option>
        ))}
      </select>

      {/* תאריך */}
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => {
          setSelectedDate(e.target.value);
          setSelectedTime('');
        }}
        disabled={!selectedLocationId}
        className="w-full border rounded-md px-3 py-2 mb-4 text-right"
      />

      {/* שעה */}
      <select
        value={selectedTime}
        onChange={(e) => setSelectedTime(e.target.value)}
        disabled={!selectedDate}
        className="w-full border rounded-md px-3 py-2 mb-4 text-right"
      >
        <option value="">בחר שעה...</option>
        {selectedLocation?.hours.map((time, idx) => (
          <option key={idx} value={time}>
            {time}
          </option>
        ))}
      </select>

      {/* המשך */}
      <button
        onClick={handleContinue}
        disabled={!selectedLocationId || !selectedDate || !selectedTime}
        className="w-full bg-blue-600 text-white py-2 rounded-md disabled:bg-gray-300"
      >
        המשך
      </button>
    </div>
  );
}
