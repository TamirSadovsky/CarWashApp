'use client';
import { CheckIcon } from '../icons';

function StepDot({
  state,
  index,
}: {
  state: 'completed' | 'active' | 'upcoming';
  index: number;
}) {
  const base =
    'w-10 h-10 rounded-full grid place-items-center border transition-colors duration-300';
  const cls =
    state === 'completed'
      ? 'bg-amber-500 border-amber-500 text-white shadow-md'
      : state === 'active'
      ? 'bg-white border-amber-500 text-amber-700 ring-4 ring-amber-100'
      : 'bg-white border-slate-300 text-slate-400';
  return (
    <div className={`${base} ${cls}`}>
      {state === 'completed' ? (
        <CheckIcon />
      ) : (
        <span className="text-sm font-bold">{index}</span>
      )}
    </div>
  );
}

export default function StepperRTL({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const stateFor = (
    n: number
  ): 'completed' | 'active' | 'upcoming' =>
    current > n ? 'completed' : current === n ? 'active' : 'upcoming';

  // Equal thirds (Step 1 = 33%, Step 2 = 66%, Step 3 = 100%)
  const clamped = Math.min(Math.max(current, 1), total);
  const percent = Math.round((clamped / total) * 100);

  return (
    <div className="mb-4" dir="rtl">
      {/* Track */}
      <div className="relative h-1.5 w-full rounded-full overflow-hidden mb-3 bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100">
        {/* Fill */}
        <div
          className="absolute right-0 top-0 h-full rounded-full
                     bg-gradient-to-l from-orange-500 via-amber-500 to-amber-400
                     shadow-[0_6px_18px_-8px_rgba(245,158,11,0.8)]
                     transition-[width] duration-300 ease-out"
          style={{ width: `${percent}%` }}
          aria-hidden
        />
      </div>

      {/* Dots + labels */}
      <div className="grid grid-cols-3 items-start text-center">
        <div className="flex flex-col items-center gap-1">
          <StepDot state={stateFor(1)} index={1} />
          <span className="text-[11px] text-slate-600">שירותים</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <StepDot state={stateFor(2)} index={2} />
          <span className="text-[11px] text-slate-600">מועד ומיקום</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <StepDot state={stateFor(3)} index={3} />
          <span className="text-[11px] text-slate-600">אישור</span>
        </div>
      </div>
    </div>
  );
}
