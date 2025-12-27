export const STEP_MIN_H = 'min-h-[520px]';

export const defaultHours = [
  '07:00','07:30','08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','12:00'
];

export const mockMachines = [
  { id: 1, name: 'מכונה 1', busy: ['08:00', '09:00', '10:20', '11:40'] },
  { id: 2, name: 'מכונה 2', busy: ['08:20', '09:40', '10:40'] },
  { id: 3, name: 'מכונה 3', busy: ['09:00', '10:00', '11:00'] },
  { id: 4, name: 'מכונה 4', busy: ['08:40', '09:40', '11:20'] },
];

export const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

export function calcWaitMinutes(selectedTime: string, machineBusy: string[]): number {
  if (!selectedTime) return 0;
  const t = toMin(selectedTime);
  const busySorted = [...machineBusy].map(toMin).sort((a, b) => a - b);
  const nextBusy = busySorted.find((x) => x >= t);
  if (nextBusy === undefined) return 0;
  const delta = nextBusy - t;
  return delta <= 0 ? 0 : delta;
}

export const isValidPhone = (v: string) => /^0\d{8,9}$/.test(v);
export const isValidCar   = (v: string) => /^\d{6,8}$/.test(v);
export const isValidInput = (v: string) => isValidPhone(v) || isValidCar(v);

export const isoToIL = (iso: string) => (iso ? iso.split('-').reverse().join('/') : '');
