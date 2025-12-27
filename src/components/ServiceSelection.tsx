'use client';

import React, { useState } from 'react';

type ServicesSelectionProps = {
  onContinue: (services: string[]) => void;
};

const mockServices: string[] = ['החלפת שמן', 'בדיקת בלמים', 'יישור גלגלים', 'החלפת פילטר', 'ניקוי מנוע'];

export default function ServicesSelection({ onContinue }: ServicesSelectionProps) {
  const [selectedServices, setSelectedServices] = useState<string[]>(['']);

  const handleServiceChange = (index: number, value: string): void => {
    const updated = [...selectedServices];
    updated[index] = value;
    setSelectedServices(updated);
  };

  const addNewService = (): void => {
    setSelectedServices((prev) => [...prev, '']);
  };

  const getAvailableOptions = (index: number): string[] => {
    return mockServices.filter(
      (service) => !selectedServices.includes(service) || selectedServices[index] === service
    );
  };

  const lastSelected = selectedServices[selectedServices.length - 1];
  const canAddMore = Boolean(lastSelected && lastSelected.trim() !== '');
  const canContinue = selectedServices.some((s) => s && s.trim() !== '');

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow-md rounded-lg text-right text-sm">
      <h2 className="text-xl font-bold mb-4 text-center">בחר את השירותים שתרצה לבצע</h2>

      {selectedServices.map((value, idx) => (
        <select
          key={idx}
          value={value}
          onChange={(e) => handleServiceChange(idx, e.target.value)}
          className="w-full border rounded-md px-3 py-2 mb-3"
        >
          <option value="">בחר שירות...</option>
          {getAvailableOptions(idx).map((service) => (
            <option key={service} value={service}>
              {service}
            </option>
          ))}
        </select>
      ))}

      {canAddMore && (
        <button
          type="button"
          className="flex items-center gap-1 text-blue-700 text-sm mb-4 hover:underline"
          onClick={addNewService}
        >
          ➕ הוסף שירות נוסף
        </button>
      )}

      <button
        onClick={() => onContinue(selectedServices.filter((s) => s && s.trim() !== ''))}
        className="w-full bg-blue-600 text-white py-2 rounded-md disabled:bg-gray-300"
        disabled={!canContinue}
      >
        המשך
      </button>
    </div>
  );
}
