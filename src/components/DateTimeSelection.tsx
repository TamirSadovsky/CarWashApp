'use client';

import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

type DateTimeSelectionProps = {
  onContinue: (data: { date: Date; time: string }) => void;
};

export default function DateTimeSelection({ onContinue }: DateTimeSelectionProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');

  const handleSubmit = () => {
    if (selectedDate && selectedTime) {
      onContinue({ date: selectedDate, time: selectedTime });
    }
  };

  const times: string[] = [
    '08:00', '08:30', '09:00', '09:30',
    '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00'
  ];

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow-md rounded-lg text-right text-sm">
      <h2 className="text-xl font-bold mb-4 text-center">בחירת תאריך ושעה</h2>

      <div className="mb-4">
        <label className="block mb-1 font-medium text-gray-700">בחר תאריך:</label>
        <DatePicker
          selected={selectedDate}
          onChange={(date: Date | null) => setSelectedDate(date)}
          dateFormat="dd/MM/yyyy"
          className="w-full border rounded-md px-3 py-2 text-right"
          placeholderText="בחר תאריך"
          minDate={new Date()}
        />
      </div>

      <div className="mb-6">
        <label className="block mb-1 font-medium text-gray-700">בחר שעה:</label>
        <select
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
          className="w-full border rounded-md px-3 py-2"
        >
          <option value="">בחר שעה מהרשימה...</option>
          {times.map((time) => (
            <option key={time} value={time}>{time}</option>
          ))}
        </select>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!selectedDate || !selectedTime}
        className="w-full bg-blue-600 text-white py-2 rounded-md disabled:bg-gray-300"
      >
        המשך
      </button>
    </div>
  );
}
