'use client';

import React, { useEffect, useRef, useState } from 'react';
import { LocationItem, Step, UserData, WorkItem } from '@/types';
import {
  STEP_MIN_H,
  isValidCar,
  isValidInput,
  isValidPhone,
} from '@/lib/utils';

import StepperRTL from './steps/Stepper';
import InputStep from './steps/InputStep';
import ChooseCarStep from './steps/ChooseCarStep';
import ServicesStep from './steps/ServicesStep';
import RegisterStep, { RegState } from './steps/RegisterStep';
import LocationTimeStep from './steps/LocationTimeStep';
import ConfirmStep from './steps/ConfirmStep';

import AppHeader from '@/components/ui/AppHeader';

/* --- Brand tokens (CarClean) --- */
const BTN_PRIMARY =
  'flex-1 rounded-2xl bg-amber-500 py-3 font-semibold text-white shadow hover:bg-amber-600 ' +
  'shadow-[0_10px_30px_-10px_rgba(245,158,11,0.6)] disabled:opacity-60 disabled:cursor-not-allowed';

const BTN_NEUTRAL =
  'flex-1 rounded-2xl border border-slate-300 bg-white py-3 text-slate-700 hover:bg-slate-50';

const BTN_SUCCESS =
  'flex-1 rounded-2xl bg-amber-500 py-3 font-semibold text-white shadow hover:bg-amber-600 ' +
  'shadow-[0_10px_30px_-10px_rgba(245,158,11,0.6)]';

const CARD_SHELL =
  // NOTE: removed overflow-hidden to avoid clipping long forms/menus;
  // scrolling is handled by the inner panel.
  'relative h-[92svh] max-h-[780px] rounded-3xl bg-white/90 backdrop-blur ' +
  'ring-1 ring-yellow-200 shadow-[0_20px_60px_-20px_rgba(0,0,0,.25)]';

/* ---- time config + helpers ---- */
const TIME_STEP_MIN = 15;
const DAY_START_HOUR = 7;
const DAY_END_HOUR = 17;

const pad2 = (n: number) => String(n).padStart(2, '0');
const toISODate = (d: Date) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

const roundUpToStep = (date: Date, stepMin = 15) => {
  const d = new Date(date);
  d.setSeconds(0, 0);
  const rem = d.getMinutes() % stepMin;
  if (rem !== 0) d.setMinutes(d.getMinutes() + (stepMin - rem));
  return d;
};

type UIMode = 'input' | 'choose' | 'register' | 'found' | 'done';

export default function BusinessLogin() {
  /* ---------------- state ---------------- */
  const [mode, setMode] = useState<UIMode>('input');
  const [step, setStep] = useState<Step>(1);

  // remember me
  const [rememberMe, setRememberMe] = useState(false);
  const [savedHint, setSavedHint] = useState<string | null>(null);

  // input
  const [phoneOrCar, setPhoneOrCar] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // choose
  const [carsForPhone, setCarsForPhone] = useState<UserData[]>([]);


  // user context
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userSnapshot, setUserSnapshot] =
    useState<{ name?: string; car?: string } | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);

  // transient success banner after registration
  const [showRegSuccess, setShowRegSuccess] = useState(false);

  // services
  const [selectedServices, setSelectedServices] = useState<string[]>(['']);
  const [workOptions, setWorkOptions] = useState<WorkItem[]>([]);
  const [worksLoading, setWorksLoading] = useState(false);
  const [worksError, setWorksError] = useState<string | null>(null);

  // locations + time (step 2)
  const [locationOptions, setLocationOptions] = useState<LocationItem[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [locationsError, setLocationsError] = useState<string | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [selectedDateISO, setSelectedDateISO] = useState('');
  const [selectedTime, setSelectedTime] = useState(''); // HH:mm
  const [initialTime, setInitialTime] = useState<string | null>(null);

  // register
  type RegisterSource = 'unknown' | 'phone' | 'car';


  type ChooseKind = 'cars' | 'phones';
  const [chooseKind, setChooseKind] = useState<ChooseKind>('cars');
  const [choices, setChoices] = useState<UserData[]>([]);
  const [registerSource, setRegisterSource] = useState<RegisterSource>('unknown');

  const [reg, setReg] = useState<RegState>({
    CostomerName: '',
    DriverName: '',
    carNum: '',
    TypeOfCar: '',
    phone: '',
  });
  const [customerNames, setCustomerNames] = useState<string[]>([]);
  const [carTypes, setCarTypes] = useState<string[]>([]);
  const [notFoundMsg, setNotFoundMsg] = useState<string>('');

  // done
  const [orderId, setOrderId] = useState<string>('');

  // scroll container ref
  const scrollRef = useRef<HTMLDivElement | null>(null);

  /* ---------------- effects ---------------- */

  // remember-me initial
  useEffect(() => {
    const v = localStorage.getItem('rememberedPhoneOrCar');
    const flag = localStorage.getItem('rememberMeFlag');
    if (v) setSavedHint(v);
    if (flag === 'true') setRememberMe(true);
  }, []);

  // Auto-enter step 1 if a new user was registered on the GuestForm page
  useEffect(() => {
    if (mode !== 'input') return;
    try {
      const raw = localStorage.getItem('cc_pending_user');
      if (!raw) return;
      const u = JSON.parse(raw);
      localStorage.removeItem('cc_pending_user');

      setUserData(u);
      setUserSnapshot({ name: u?.DriverName, car: u?.CarNum });
      setIsNewUser(true);
      setMode('found');  // jump into the flow
      setStep(1);        // start at services
      setShowRegSuccess(true); // show success banner once
    } catch { }
  }, [mode]);

  // auto-hide registration success banner
  useEffect(() => {
    if (!showRegSuccess) return;
    const t = setTimeout(() => setShowRegSuccess(false), 3000);
    return () => clearTimeout(t);
  }, [showRegSuccess]);

  // works (by car type)
  useEffect(() => {
    const load = async () => {
      if (!userData?.CarType) return;
      setWorksLoading(true);
      setWorksError(null);
      try {
        const res = await fetch(`/api/works/by-car-type?carType=${encodeURIComponent(userData.CarType)}`);
        if (!res.ok) throw new Error('failed works');
        const rows: WorkItem[] = await res.json();
        setWorkOptions(rows);
        setSelectedServices(['']);
      } catch {
        setWorksError('נכשלה טעינת רשימת השירותים');
      } finally {
        setWorksLoading(false);
      }
    };
    load();
  }, [userData?.CarType]);

  // locations + default time
  useEffect(() => {
    const load = async () => {
      setLocationsLoading(true);
      setLocationsError(null);
      try {
        const res = await fetch('/api/car/snif-list');
        if (!res.ok) throw new Error('failed locations');
        const rows: LocationItem[] = await res.json();
        setLocationOptions(rows);

        const now = new Date();
        let targetDate = new Date(now);
        targetDate.setHours(0, 0, 0, 0);

        const rounded = roundUpToStep(now, TIME_STEP_MIN);

        const firstSlotToday = new Date(targetDate);
        firstSlotToday.setHours(DAY_START_HOUR, 0, 0, 0);

        const lastSlotToday = new Date(targetDate);
        lastSlotToday.setHours(DAY_END_HOUR, 0, 0, 0);

        let timeStr: string;
        if (rounded < firstSlotToday) {
          timeStr = `${pad2(DAY_START_HOUR)}:00`;
        } else if (rounded > lastSlotToday) {
          const tomorrow = new Date(targetDate);
          tomorrow.setDate(tomorrow.getDate() + 1);
          targetDate = tomorrow;
          timeStr = `${pad2(DAY_START_HOUR)}:00`;
        } else {
          timeStr = `${pad2(rounded.getHours())}:${pad2(rounded.getMinutes())}`;
        }

        setSelectedDateISO(toISODate(targetDate));
        setSelectedTime(timeStr);
        setInitialTime(timeStr);
      } catch {
        setLocationsError('נכשלה טעינת רשימת המיקומים');
        setLocationOptions([]);
      } finally {
        setLocationsLoading(false);
      }
    };
    load();
  }, []);

  // register lists
  useEffect(() => {
    if (mode !== 'register') return;
    (async () => {
      try {
        const res = await fetch('/api/car/customer-list');
        const rows = res.ok ? await res.json() : [];
        const names = Array.isArray(rows)
          ? rows.map((x: any) => (x?.CostomerName ?? '').toString().trim()).filter(Boolean)
          : [];
        setCustomerNames(names);
      } catch {
        setCustomerNames([]);
      }

      try {
        const tRes = await fetch('/api/car/car-types');
        const data = tRes.ok ? await tRes.json() : [];
        const types =
          Array.isArray((data as any)?.types)
            ? (data as any).types
            : Array.isArray(data)
              ? data
              : [];
        setCarTypes(types);
      } catch {
        setCarTypes([]);
      }
    })();
  }, [mode]);

  // 🔝 Reset scroll position whenever the step OR mode changes
  useEffect(() => {
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: 0, behavior: 'auto' });
      }
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
    });
  }, [step, mode]);

  useEffect(() => {
    const v = phoneOrCar.trim();
    if (inputError && (v === '' || isValidInput(v))) setInputError(null);
  }, [phoneOrCar, inputError]);

  /* ---------------- handlers ---------------- */

  const uniqueByCar = (arr: UserData[]) => {
    const map = new Map<string, UserData>();
    arr.forEach((u) => {
      const car = (u.CarNum ?? '').toString().trim();
      const type = (u.CarType ?? '').toString().trim();
      const key = `${car}|${type}`;
      if (!map.has(key)) map.set(key, u);
    });
    return Array.from(map.values()).filter((u) => (u.CarNum ?? '').toString().trim() !== '');
  };

  const uniqueByCarPhone = (arr: UserData[]) => {
    const map = new Map<string, UserData>();
    arr.forEach((u) => {
      const car = (u.CarNum ?? '').toString().trim();
      const type = (u.CarType ?? '').toString().trim();
      const phone = (u.Phone ?? '').toString().trim();
      const key = `${car}|${type}|${phone}`;
      if (!map.has(key)) map.set(key, u);
    });
    return Array.from(map.values()).filter((u) => (u.CarNum ?? '').toString().trim() !== '');
  };


  const setPickedUser = (u: UserData) => {
    setUserData(u);
    setUserSnapshot({
      name: u.DriverName && u.DriverName !== 'לא ידוע' ? u.DriverName : undefined,
      car: u.CarNum,
    });
    setIsNewUser(false);
    setMode('found');
    setStep(1);
  };

  const handleSearch = async (override?: string) => {
    const v = (override ?? phoneOrCar).trim();
    if (!v || !isValidInput(v)) {
      setInputError('נא להזין טלפון ישראלי תקני או מספר רכב בן 6-8 ספרות');
      return;
    }
    setInputError(null);
    setLoading(true);
    try {
      if (rememberMe) {
        localStorage.setItem('rememberedPhoneOrCar', v);
        localStorage.setItem('rememberMeFlag', 'true');
        setSavedHint(v);
      } else {
        localStorage.removeItem('rememberedPhoneOrCar');
        localStorage.removeItem('rememberMeFlag');
        setSavedHint(null);
      }

      const isPhone = isValidPhone(v);
      const isCar = isValidCar(v);

      if (isPhone) {
        const [listRes, postRes] = await Promise.allSettled([
          fetch(`/api/car/customer-list?phone=${encodeURIComponent(v)}`),
          fetch('/api/car/check-car-phone', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: v, carNum: '' }),
          }),
        ]);

        let listA: UserData[] = [];
        let listB: UserData[] = [];
        if (listRes.status === 'fulfilled' && listRes.value.ok) listA = await listRes.value.json();
        if (postRes.status === 'fulfilled' && postRes.value.ok) listB = await postRes.value.json();

        const uniqueCars = uniqueByCar([...listA, ...listB]);

        if (uniqueCars.length === 0) {
          setReg({ CostomerName: '', DriverName: '', carNum: '', TypeOfCar: '', phone: v });
          setNotFoundMsg('לא נמצאו נתונים לטלפון הזה. ניתן להירשם כאן:');
          setRegisterSource('phone');
          setMode('register');
          return;
        }
        if (uniqueCars.length > 1) {
          setChooseKind('cars');
          setChoices(uniqueCars);
          setMode('choose');
          return;
        }
        setPickedUser(uniqueCars[0]);
        return;
      }

      if (isCar) {
        // 1) bring all phones that have appointments with this car
        const phonesRes = await fetch(
          `/api/car/phones-by-car?carNum=${encodeURIComponent(v)}`
        );
        const phones: string[] = phonesRes.ok ? await phonesRes.json() : [];

        // if no phones - go to register
        if (!phones || phones.length === 0) {
          setReg({ CostomerName: '', DriverName: '', carNum: v, TypeOfCar: '', phone: '' });
          setNotFoundMsg('לא נמצאו נתונים למספר הרכב הזה. ניתן להירשם כאן:');
          setRegisterSource('car');
          setMode('register');
          return;
        }

        // 2) fetch customer-list for each phone and keep only rows for this car
        const results = await Promise.allSettled(
          phones.map(async (p) => {
            const r = await fetch(`/api/car/customer-list?phone=${encodeURIComponent(p)}`);
            const rows: UserData[] = r.ok ? await r.json() : [];
            return rows.filter((x) => String(x?.CarNum ?? '').trim() === v);
          })
        );

        // 3) merge all results into one array
        const merged: UserData[] = results
          .filter(
            (x): x is PromiseFulfilledResult<UserData[]> => x.status === 'fulfilled'
          )
          .flatMap((x) => x.value);

        // 4) if still nothing found - go to register
        if (merged.length === 0) {
          setReg({ CostomerName: '', DriverName: '', carNum: v, TypeOfCar: '', phone: '' });
          setNotFoundMsg('לא נמצאו נתונים למספר הרכב הזה. ניתן להירשם כאן:');
          setRegisterSource('car');
          setMode('register');
          return;
        }

        // 5) de-dupe (by car+type+phone) so same record won't appear twice
        const uniquePhones = uniqueByCarPhone(merged);

        // 6) if more than 1 option - show chooser (same car, different phones)
        if (uniquePhones.length > 1) {
          setChooseKind('phones');
          setChoices(uniquePhones);
          setMode('choose');
          return;
        }

        // 7) single match - continue
        setPickedUser(uniquePhones[0]);
        return;
      }


      setInputError('קלט לא תקין');
    } catch (e) {
      console.error(e);
      alert('אירעה שגיאה. נסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  const useSavedAndSearch = () => {
    if (!savedHint) return;
    setPhoneOrCar(savedHint);
    setInputError(null);
    handleSearch(savedHint);
  };

  const saveNewClient = async () => {
    if (!reg.CostomerName || !reg.DriverName || !reg.carNum || !reg.TypeOfCar) {
      alert('נא למלא את כל השדות');
      return;
    }
    const payload = {
      CostomerName: reg.CostomerName,
      DriverName: reg.DriverName,
      carNum: reg.carNum,
      TypeOfCar: reg.TypeOfCar || 'לא צויין',
      phone: reg.phone,
    };

    try {
      const response = await fetch('/api/car/register-new-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      const row = Array.isArray(data) && data.length > 0 ? data[0] : payload;

      const u: UserData = {
        CarNum: row?.CarNum ?? reg.carNum,
        DriverName: row?.DriverName ?? reg.DriverName,
        CostomerName: row?.CostomerName ?? reg.CostomerName,
        CarType: row?.TypeOfCar ?? row?.CarType ?? reg.TypeOfCar,
        Phone: row?.PhoneN ?? row?.Phone ?? reg.phone,
      };

      setUserData(u);
      setUserSnapshot({
        name: u.DriverName && u.DriverName !== 'לא ידוע' ? u.DriverName : undefined,
        car: u.CarNum,
      });
      setIsNewUser(true);
      setMode('found');
      setStep(1);
      setShowRegSuccess(true);
    } catch (err) {
      console.error('register-new-client error:', err);
      alert('אירעה שגיאה בשליחת הטופס. נסה שוב מאוחר יותר.');
    }
  };

  const handleBooked = async () => {
    try {
      if (!userData || !selectedLocationId || !selectedDateISO || !selectedTime) {
        alert('חסר מידע להזמנה');
        return;
      }
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carNum: userData.CarNum,
          carType: userData.CarType,
          phone: userData.Phone,
          driverName: userData.DriverName,
          customerName: userData.CostomerName,
          dateISO: selectedDateISO,     // YYYY-MM-DD
          time: selectedTime,           // HH:mm
          locationId: selectedLocationId,
          locationName: (locationOptions.find(l => l.id === selectedLocationId)?.name) || '',
          services: (selectedServices ?? []).filter(Boolean),
          comments: '',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || 'Order create failed');
      }

      setOrderId(data.orderId || `CC-${Math.floor(100000 + Math.random() * 900000)}`);
      setMode('done');
    } catch (e: any) {
      console.error(e);
      alert('נכשלה יצירת ההזמנה. נסה שוב.');
    }
  };



  /* ---------------- derived ---------------- */
  const allOptionNames = workOptions
    .map(w => (w?.name ?? '').toString().trim())
    .filter(Boolean);

  const selectedReal = (selectedServices ?? [])
    .map(s => (s ?? '').trim())
    .filter(s => s !== '');

  const remainingCount = allOptionNames.filter(
    name => !selectedReal.includes(name)
  ).length;

  const lastSelected = (selectedServices[selectedServices.length - 1] ?? '').trim();

  const canAddMore =
    lastSelected !== '' && remainingCount > 0 && selectedServices.length < 5;

  const canContinue =
    selectedReal.length > 0 && workOptions.length > 0 && !worksLoading;

  // welcome chip
  const WelcomeChip = userData && (
    <div className="inline-flex items-center justify-center gap-2 rounded-full
                    bg-amber-50 text-amber-800 ring-1 ring-amber-200
                    px-4 py-2 text-sm">
      <span>{isNewUser ? 'ברוך הבא' : 'ברוך שובך'}{userSnapshot?.name ? `, ${userSnapshot.name}` : ''}</span>
      {userSnapshot?.car && <span className="mx-1 h-1.5 w-1.5 rounded-full bg-amber-400" />}
      {userSnapshot?.car && <span>רכב: <b>{userSnapshot.car}</b></span>}
    </div>
  );

  // which screens may scroll
  const allowScroll =
    (mode === 'found' && step === 2) ||  // time & location
    mode === 'done' ||                   // confirmation
    mode === 'register' ||               // long register form
    mode === 'choose';                   // long car list

  /* ---------------- UI ---------------- */

  return (
    <div
      // removed overflow-hidden here so the inner panel can manage scrolling on mobile
      className="h-[100svh] grid place-items-center p-4
                 bg-gradient-to-br from-amber-100 via-yellow-50 to-rose-50"
      dir="rtl"
    >
      <div className="w-full max-w-xl min-h-0">
        <div className={CARD_SHELL}>
          <div className="flex h-full min-h-0 flex-col">
            {/* App header */}
            <AppHeader
              subtitle="מערכת להזמנת שטיפה לרכב"
              homeHref="/"
              variant="yellow"
              logoSrc="/logo.jpg"
            />

            {/* Step header */}
            {mode === 'found' && userData && (
              <div className="px-6 sm:px-8 pt-2 pb-3 space-y-2">
                {showRegSuccess && (
                  <div className="rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 px-4 py-2 text-center text-sm">
                    ✅ נרשמת בהצלחה!
                  </div>
                )}
                {WelcomeChip}
                <StepperRTL current={Math.min(step, 3)} total={3} />
              </div>
            )}

            {/* body (scrollable panel) */}
            <div
              ref={scrollRef}
              className={
                allowScroll
                  ? 'min-h-0 flex-1 basis-0 overflow-y-auto px-0 overscroll-contain touch-pan-y'
                  : 'min-h-0 flex-1 basis-0 overflow-hidden px-0'
              }
              dir="ltr"
              style={
                allowScroll
                  ? { scrollbarGutter: 'stable both-edges', WebkitOverflowScrolling: 'touch' }
                  : undefined
              }
            >
              <div className="px-6 sm:px-8 pb-2 pt-1" dir="rtl">
                {mode === 'input' && (
                  <InputStep
                    value={phoneOrCar}
                    setValue={setPhoneOrCar}
                    onSubmit={() => handleSearch()}
                    error={inputError}
                    setError={setInputError}
                    rememberMe={rememberMe}
                    setRememberMe={setRememberMe}
                    savedHint={savedHint}
                    onUseSaved={useSavedAndSearch}
                  />
                )}

                {mode === 'choose' && (
                  <ChooseCarStep kind={chooseKind} items={choices} onPick={setPickedUser} />
                )}


                {mode === 'register' && (
                  <RegisterStep
                    reg={reg}
                    setReg={setReg}
                    customerNames={customerNames}
                    carTypes={carTypes}
                    notFoundMsg={notFoundMsg}
                    registerSource={registerSource} // NEW
                  />
                )}

                {mode === 'found' && userData && (
                  <div className={`mt-4 ${STEP_MIN_H}`}>
                    {step === 1 && (
                      <ServicesStep
                        options={workOptions}
                        selected={selectedServices}
                        setSelected={setSelectedServices}
                        loading={worksLoading}
                        error={worksError}
                        canAddMore={canAddMore}
                      />
                    )}

                    {step === 2 && (
                      <LocationTimeStep
                        locations={locationOptions}
                        loading={locationsLoading}
                        error={locationsError}
                        selectedLocationId={selectedLocationId}
                        setSelectedLocationId={setSelectedLocationId}
                        selectedDateISO={selectedDateISO}
                        setSelectedDateISO={setSelectedDateISO}
                        selectedTime={selectedTime}
                        setSelectedTime={setSelectedTime}
                      //defaultTimeForStatus={initialTime}
                      />
                    )}

                    {step === 3 && (
                      <ConfirmStep
                        user={userData}
                        services={selectedServices}
                        location={locationOptions.find((l) => l.id === selectedLocationId)}
                        dateISO={selectedDateISO}
                        time={selectedTime}
                        onBooked={handleBooked}
                      />
                    )}
                  </div>
                )}

                {mode === 'done' && (
                  <BookingDone
                    user={userData!}
                    orderId={orderId}
                    services={selectedServices}
                    location={locationOptions.find((l) => l.id === selectedLocationId)}
                    dateISO={selectedDateISO}
                    time={selectedTime}
                  />
                )}
              </div>
            </div>

            {/* footer */}
            {mode !== 'done' && (
              <div className="px-6 sm:px-8 pb-6 pt-2">
                <div className="flex gap-3">
                  {mode === 'input' ? (
                    <button
                      onClick={() => handleSearch()}
                      disabled={loading || !phoneOrCar.trim() || !!inputError}
                      className={BTN_PRIMARY}
                    >
                      {loading ? 'בודק...' : 'המשך'}
                    </button>
                  ) : mode === 'choose' ? (
                    <button
                      onClick={() => setMode('input')}
                      className={BTN_NEUTRAL}
                    >
                      חזור
                    </button>
                  ) : mode === 'register' ? (
                    <>
                      <button
                        onClick={() => setMode('input')}
                        className={BTN_NEUTRAL}
                      >
                        חזור
                      </button>
                      <button
                        onClick={saveNewClient}
                        className={BTN_SUCCESS}
                      >
                        שמור והמשך
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => (step > 1 ? setStep((s) => ((s - 1) as Step)) : setMode('input'))}
                        className={BTN_NEUTRAL}
                      >
                        חזור
                      </button>
                      {step === 1 && (
                        <button
                          onClick={() => setStep(2)}
                          disabled={!canContinue}
                          className={BTN_PRIMARY}
                        >
                          המשך
                        </button>
                      )}
                      {step === 2 && (
                        <button
                          onClick={() => setStep(3)}
                          disabled={!selectedLocationId || !selectedDateISO || !selectedTime}
                          className={BTN_PRIMARY}
                        >
                          המשך
                        </button>
                      )}
                      {step === 3 && (
                        <button
                          onClick={handleBooked}
                          className={BTN_SUCCESS}
                        >
                          סיום והזמן
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** ---------- Done screen (post booking) ---------- */
function BookingDone({
  user,
  orderId,
  services,
  location,
  dateISO,
  time,
}: {
  user: UserData;
  orderId: string;
  services: string[];
  location?: LocationItem;
  dateISO: string;
  time: string;
}) {
  const serviceText = services.filter(Boolean).join(', ') || '—';

  const dateIL = (() => {
    const [y, m, d] = dateISO.split('-');
    if (!y || !m || !d) return dateISO;
    return `${d}-${m}-${y}`;
  })();

  const BTN_PRIMARY_SM =
    'inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-4 py-2 text-white text-sm ' +
    'shadow hover:bg-amber-600 shadow-[0_10px_30px_-10px_rgba(245,158,11,0.6)]';
  const BTN_OUTLINE_SM =
    'inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-amber-300 bg-white px-4 py-2 text-sm text-amber-800 ' +
    'hover:bg-amber-50';

  const IconWaze = (
    <svg width="18" height="18" viewBox="0 0 64 64" aria-hidden="true">
      <path
        d="M50 36c6 0 10-4.8 10-10.7C60 15 49.6 8 36.8 8 24 8 14 15.7 14 26.3c0 4.5 1.8 7.8 3.5 9.7l-3.2 3.2A4 4 0 0 0 12 42c0 2.2 1.8 4 4 4h4.3l2.7-2.7C26.4 46.2 31.3 48 36.8 48c2.7 0 5.3-.3 7.8-.9 1.6 2 4 3.3 6.7 3.3 4.7 0 8.5-3.8 8.5-8.5V40c-2.1 1.2-4.5 2-7 2-1.1 0-2.1-.1-3-.4-1.6 2.7-4.6 4.4-7.8 4.4-3.6 0-6.7-2-8.2-5"
        fill="#00b3ff" stroke="#0a0a0a" strokeWidth="2" strokeLinejoin="round"
      />
      <circle cx="40" cy="28" r="3" fill="#0a0a0a" />
      <circle cx="52" cy="28" r="3" fill="#0a0a0a" />
      <path d="M44 34c2.5 1.8 5.5 1.8 8 0" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );

  const IconMaps = (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <defs>
        <linearGradient id="gmapG" x1="9" y1="39" x2="39" y2="9" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#34a853" />
          <stop offset="1" stopColor="#0f9d58" />
        </linearGradient>
      </defs>
      <path d="M24 3C14.6 3 7 10.6 7 20c0 11.2 12.4 23.9 16.2 26.9a2 2 0 0 0 2.6 0C29.6 43.9 41 31.2 41 20 41 10.6 33.4 3 24 3z" fill="url(#gmapG)" />
      <circle cx="24" cy="18" r="7" fill="#ea4335" />
      <path d="M12 30l8-5 8 5-8 10z" fill="#fbbc05" opacity=".9" />
      <path d="M24 14l3.5 4L24 22l-3.5-4z" fill="#4285f4" />
      <circle cx="24" cy="18" r="2.8" fill="#fff" />
    </svg>
  );

  const goMaps = () =>
    window.open(`https://maps.google.com/?q=${encodeURIComponent(location?.name || '')}`, '_blank');
  const goWaze = () =>
    window.open(`https://waze.com/ul?q=${encodeURIComponent(location?.name || '')}`, '_blank');

  const addToCalendar = () => {
    try {
      const title = `שטיפת רכב - ${location?.name || ''}`;
      const start = new Date(`${dateISO}T${time}:00`);
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      const toics = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
        title
      )}&dates=${toics(start)}%2F${toics(end)}&details=${encodeURIComponent(
        `מספר הזמנה: ${orderId}`
      )}&location=${encodeURIComponent(location?.name || '')}`;
      window.open(href, '_blank');
    } catch { }
  };

  return (
    <div className="px-6 sm:px-8 pb-6 pt-1" dir="rtl">
      <div className="mb-4">
        <div className="rounded-xl bg-amber-50 text-amber-800 ring-1 ring-amber-200 px-4 py-3 text-center shadow-sm">
          ההזמנה נקלטה!
          <div className="mt-1 font-bold text-emerald-700">{orderId}</div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 shadow-sm text-sm sm:text-base">
        <div className="grid grid-cols-[minmax(110px,140px)_1fr] items-center gap-y-3 gap-x-6">
          <div className="text-right text-slate-500">רכב</div>
          <div className="font-medium">{user.CarNum || '—'}</div>

          <div className="text-right text-slate-500">שירותים</div>
          <div className="font-medium">{serviceText}</div>

          <div className="text-right text-slate-500">מיקום</div>
          <div className="font-medium">{location?.name || '—'}</div>

          <div className="text-right text-slate-500">תאריך</div>
          <div className="font-medium whitespace-nowrap" dir="ltr">{dateIL}</div>

          <div className="text-right text-slate-500">שעה</div>
          <div className="font-medium whitespace-nowrap" dir="ltr">{time}</div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <button onClick={addToCalendar} className={BTN_PRIMARY_SM}>📅 הוסף ליומן</button>
          <button onClick={goWaze} className={BTN_OUTLINE_SM} aria-label="נווט עם Waze">
            {IconWaze}<span>Waze</span>
          </button>
          <button onClick={goMaps} className={BTN_OUTLINE_SM} aria-label="נווט עם Google Maps">
            {IconMaps}<span>Maps</span>
          </button>
        </div>
      </div>
    </div>
  );
}
