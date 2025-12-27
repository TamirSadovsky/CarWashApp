export function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 12l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
export function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg className={`transition-transform ${open ? 'rotate-180' : ''}`} width="16" height="16" viewBox="0 0 24 24">
      <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
export const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" className="text-slate-400">
    <rect x="3" y="4" width="18" height="18" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
    <path d="M3 9h18M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);
export const PinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" className="text-slate-400">
    <path d="M12 22s7-6.14 7-11a7 7 0 1 0-14 0c0 4.86 7 11 7 11Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="12" cy="11" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);
export const ClockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" className="text-slate-400">
    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.8" />
    <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);
