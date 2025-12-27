'use client';

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/ui/AppHeader';
import FancySelect from '@/components/ui/FancySelect';

type UserLike = {
  CarNum?: string;
  DriverName?: string;
  CostomerName?: string;
  CarType?: string;
  Phone?: string;
};

type Props = {
  /** optional — if not provided, we’ll redirect to /business */
  onRegistered?: (user: UserLike) => void;
  defaultPhoneOrCar?: string;
  isBusinessClient?: boolean;
};

export default function GuestForm({
  onRegistered,
  defaultPhoneOrCar = '',
  isBusinessClient = false,
}: Props) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    companyName: '',
    driverName: '',
    carNumber: '',
    carType: '',
    phone: '',
  });
  const [touched, setTouched] = useState<{ phone?: boolean; car?: boolean }>({});
  const [customersList, setCustomersList] = useState<string[]>([]);
  const [carTypes, setCarTypes] = useState<string[]>([]);
  const [loadingTypes, setLoadingTypes] = useState<boolean>(false);
  const [typesError, setTypesError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ✅ toast state (no layout shift)
  const [showToast, setShowToast] = useState(false);

  const onlyDigits = (s: string) => s.replace(/\D/g, '');

  useEffect(() => {
    if (/^\d{6,8}$/.test(defaultPhoneOrCar)) {
      setFormData((p) => ({ ...p, carNumber: defaultPhoneOrCar }));
    } else if (/^0\d{8,9}$/.test(defaultPhoneOrCar)) {
      setFormData((p) => ({ ...p, phone: defaultPhoneOrCar }));
    }
  }, [defaultPhoneOrCar]);

  useEffect(() => {
    if (!isBusinessClient) return;
    fetch('/api/car/customer-list')
      .then((r) => r.json())
      .then((rows) => {
        const names = Array.isArray(rows)
          ? rows.map((x: any) => (x?.CostomerName ?? '').toString().trim()).filter(Boolean)
          : [];
        setCustomersList(names);
      })
      .catch(() => { });
  }, [isBusinessClient]);

  useEffect(() => {
    const load = async () => {
      setLoadingTypes(true);
      setTypesError(null);
      try {
        const res = await fetch('/api/car/car-types');
        if (!res.ok) throw new Error();
        const data = await res.json();
        setCarTypes(Array.isArray((data as any)?.types) ? (data as any).types : []);
      } catch {
        setTypesError('שגיאה בטעינת סוגי הרכב');
      } finally {
        setLoadingTypes(false);
      }
    };
    load();
  }, []);

  const isPhoneValid = /^0\d{8,9}$/.test(formData.phone);
  const isCarValid = /^\d{6,8}$/.test(formData.carNumber);
  const requiredFilled =
    formData.companyName.trim() !== '' &&
    formData.driverName.trim() !== '' &&
    isCarValid &&
    formData.carType.trim() !== '';

  const baseField =
    'w-full rounded-xl border bg-white px-4 py-3 outline-none appearance-none transition';
  const ok = 'border-slate-200 focus:border-yellow-300 focus:ring-2 focus:ring-yellow-100';
  const err = 'border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-100';

  const phoneCls = `${baseField} ${touched.phone && !isPhoneValid ? err : ok} text-left`;
  const carCls = `${baseField} ${touched.car && !isCarValid ? err : ok} text-left`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      setFormData((p) => ({ ...p, phone: onlyDigits(value).slice(0, 10) }));
      return;
    }
    if (name === 'carNumber') {
      setFormData((p) => ({ ...p, carNumber: onlyDigits(value).slice(0, 8) }));
      return;
    }
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const normalizeRow = (rowOrPayload: any): UserLike => ({
    CarNum: (rowOrPayload?.CarNum ?? rowOrPayload?.carNum ?? formData.carNumber)?.toString(),
    DriverName: (rowOrPayload?.DriverName ?? formData.driverName)?.toString(),
    CostomerName: (rowOrPayload?.CostomerName ?? formData.companyName)?.toString(),
    CarType: (rowOrPayload?.TypeOfCar ?? rowOrPayload?.CarType ?? formData.carType)?.toString(),
    Phone: (rowOrPayload?.PhoneN ?? rowOrPayload?.Phone ?? rowOrPayload?.phone ?? formData.phone)?.toString(),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ phone: true, car: true });
    if (!requiredFilled || !isPhoneValid) return;

    const payload = {
      CostomerName: formData.companyName,
      DriverName: formData.driverName,
      carNum: formData.carNumber,
      TypeOfCar: formData.carType || 'לא צויין',
      phone: formData.phone,
    };

    try {
      setSubmitting(true);
      const response = await fetch('/api/car/register-new-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      const source = Array.isArray(data) && data.length > 0 ? data[0] : payload;
      const user = normalizeRow(source);

      // ✅ Show mobile-friendly toast near the button (no reflow)
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        if (onRegistered) {
          onRegistered(user); // parent moves to Step 1
        } else {
          // fallback: persist & go to /business
          try { localStorage.setItem('cc_pending_user', JSON.stringify(user)); } catch { }
          router.push('/business');
        }
      }, 1800);
    } catch {
      alert('אירעה שגיאה בשליחת הטופס. נסה שוב מאוחר יותר.');
    } finally {
      setSubmitting(false);
    }
  };

  // Fixed bottom toast (portal to body so it isn't clipped)
  const Toast = () =>
    typeof window !== 'undefined'
      ? ReactDOM.createPortal(
        <div
          dir="rtl"
          className="fixed inset-x-0 bottom-24 mx-auto w-[min(92%,28rem)] rounded-2xl
                       bg-emerald-600 text-white text-sm font-medium text-center
                       px-4 py-3 shadow-lg"
          style={{ zIndex: 10000 }}
        >
          ✅ נרשמת בהצלחה! מעבירים אותך לקביעת שטיפה…
        </div>,
        document.body
      )
      : null;

  return (
    <div
      className="min-h-screen grid place-items-center p-4 bg-gradient-to-br from-amber-100 via-orange-100 to-rose-100"
      dir="rtl"
    >
      <div className="w-full max-w-xl">
        <style>{`.rs__menu-portal{z-index:9999 !important;}`}</style>

        <div className="relative rounded-3xl bg-white/90 backdrop-blur ring-1 ring-slate-200 shadow-[0_20px_60px_-20px_rgba(0,0,0,.25)] overflow-visible">
          <AppHeader subtitle="הרשמת לקוח חדש" homeHref="/" />

          <form onSubmit={handleSubmit} className="px-6 sm:px-8 pt-4 pb-6 text-right">
            {/* שם לקוח */}
            <div className="mb-4">
              <label className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-600">
                <span>שם לקוח</span>
                <span className="rounded-full bg-slate-100 px-2 py-[2px] text-[11px] text-slate-700">חובה</span>
              </label>
              {isBusinessClient ? (
                <select
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className={`${baseField} ${ok}`}
                  required
                  size={Math.min(customersList.length || 1, 6)}
                >
                  <option value="">בחר שם לקוח…</option>
                  {customersList.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  name="companyName"
                  placeholder="לדוגמה: יוסי כהן בע״מ"
                  value={formData.companyName}
                  onChange={handleChange}
                  className={`${baseField} ${ok}`}
                  required
                />
              )}
            </div>

            {/* שם נהג */}
            <div className="mb-4">
              <label className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-600">
                <span>שם נהג</span>
                <span className="rounded-full bg-slate-100 px-2 py-[2px] text-[11px] text-slate-700">חובה</span>
              </label>
              <input
                type="text"
                name="driverName"
                placeholder="לדוגמה: דוד לוי"
                value={formData.driverName}
                onChange={handleChange}
                className={`${baseField} ${ok}`}
                required
              />
            </div>

            {/* מספר רכב */}
            <div className="mb-2">
              <label className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-600">
                <span>מספר רכב</span>
                <span className="rounded-full bg-slate-100 px-2 py-[2px] text-[11px] text-slate-700">חובה</span>
              </label>
              <input
                type="text"
                name="carNumber"
                dir="ltr"
                inputMode="numeric"
                pattern="\d{6,8}"
                maxLength={8}
                placeholder="לדוגמה: 1234567"
                value={formData.carNumber}
                onChange={handleChange}
                onBlur={() => setTouched((t) => ({ ...t, car: true }))}
                className={carCls}
                aria-invalid={touched.car && !isCarValid}
                required
              />
              {touched.car && !isCarValid && (
                <div className="mt-1 text-[11px] text-rose-600">מספר רכב לא תקין.</div>
              )}
            </div>

            {/* סוג רכב */}
            <div className="mb-4 mt-3">
              <label className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-600">
                <span>סוג רכב</span>
                <span className="rounded-full bg-slate-100 px-2 py-[2px] text-[11px] text-slate-700">חובה</span>
              </label>
              <div style={{ minWidth: 0 }} className="w-full">
                <select
                  name="carType"
                  value={formData.carType}
                  onChange={(e) => setFormData((p) => ({ ...p, carType: e.target.value }))}
                  className={`${baseField} ${ok}`}
                  required
                  disabled={loadingTypes || !!typesError}
                  size={Math.min(carTypes.length || 1, 6)}
                >
                  <option value="">
                    {loadingTypes ? 'טוען סוגי רכב…' : typesError ? 'שגיאה בטעינה' : 'בחר סוג רכב…'}
                  </option>
                  {carTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {typesError && <div className="mt-1 text-xs text-rose-600">{typesError}</div>}
            </div>

            {/* טלפון (אופציונלי) */}
            <div className="mb-3">
              <label className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-600">
                <span>טלפון</span>
              </label>
              <input
                id="phone"
                type="tel"
                name="phone"
                dir="ltr"
                inputMode="numeric"
                pattern="0\d{8,9}"
                maxLength={10}
                placeholder="לדוגמה: 0501234567"
                value={formData.phone}
                onChange={handleChange}
                onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                className={phoneCls}
                aria-invalid={touched.phone && !isPhoneValid}
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !requiredFilled || !isPhoneValid}
              className="mt-3 w-full rounded-xl py-3 font-semibold
                         text-slate-900
                         bg-gradient-to-l from-amber-400 to-yellow-300
                         hover:from-amber-500 hover:to-yellow-400
                         ring-1 ring-yellow-300
                         shadow-[0_10px_30px_-10px_rgba(234,179,8,.55)]
                         transition disabled:bg-slate-300 disabled:text-white"
            >
              {submitting ? 'שולח…' : 'להרשמה'}
            </button>
          </form>
        </div>
      </div>

      {showToast && <Toast />}
    </div>
  );
}
