'use client';

import Link from 'next/link';
import Image from 'next/image';

/* אייקון קטן לעיטור */
const Spark = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden className="opacity-80">
    <path d="M12 3l1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7L12 3z" fill="currentColor" />
  </svg>
);

export default function Home() {
  return (
    <main
      className="min-h-screen grid place-items-center overflow-hidden bg-gradient-to-br from-amber-100 via-orange-100 to-rose-100 p-4"
      dir="rtl"
    >
      {/* עומק רקע עדין */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-yellow-300/40 blur-3xl" />
        <div className="absolute -bottom-24 -right-20 h-72 w-72 rounded-full bg-slate-300/40 blur-3xl" />
      </div>

      <section className="relative w-full max-w-xl rounded-3xl bg-white/90 backdrop-blur ring-1 ring-slate-200 shadow-[0_20px_60px_-20px_rgba(0,0,0,.25)] overflow-hidden">
        {/* פס מותג עם לוגו בלבד */}
        <Link href="/" className="relative h-24 w-full rounded-b-3xl bg-gradient-to-l from-amber-400 to-yellow-300 block">
          <div className="absolute inset-0 grid place-items-center">
            {/* ודא שהקובץ /public/logo.png קיים */}
            <Image
              src="/logo.jpg"
              alt="לוגו"
              width={72}
              height={72}
              className="h-16 w-auto object-contain drop-shadow"
              priority
            />
          </div>
        </Link>

        <div className="px-6 sm:px-10 py-8">
          {/* כותרת וטקסט */}
          <header className="text-center mb-6">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
              {/*<span className="bg-gradient-to-r from-amber-600 to-yellow-400 bg-clip-text text-transparent">Shine Track</span>*/}
              <span className="text-slate-900">Shine Truck Wash</span>
            </h1>
            <p className="mt-2 text-sm text-slate-600">מערכת חכמה להזמנת שטיפת רכב</p>
          </header>

          {/* ערכי מוצר */}
          {/*
          <div className="mx-auto mb-8 flex flex-wrap items-center justify-center gap-2 max-w-sm">
            <span className="inline-flex items-center gap-2 rounded-full bg-yellow-50 text-yellow-800 text-[13px] px-3 py-1 ring-1 ring-yellow-300">
              <Spark /> שטיפה במהירות שיא
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 text-slate-700 text-[13px] px-3 py-1 ring-1 ring-slate-200">
              <Spark /> ניהול חכם ועדכונים בזמן אמת
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-700 text-[13px] px-3 py-1 ring-1 ring-emerald-200">
              <Spark /> חוויה פשוטה וזורמת
            </span>
          </div>
          */}

          {/* קריאות לפעולה בצבעי המותג */}
          <div className="flex flex-col gap-4 max-w-sm mx-auto">
            {/* ראשי: צהוב-שחור */}
            <Link
              href="/guest"
              className="group relative inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5
                         font-semibold text-slate-900 transition
                         bg-gradient-to-l from-amber-400 to-yellow-300 hover:from-amber-500 hover:to-yellow-400
                         ring-1 ring-yellow-300 shadow-[0_10px_30px_-10px_rgba(234,179,8,.55)]"
            >
              הזמנת שטיפה — לקוח מזדמן
              <span className="absolute left-4 h-2 w-2 rounded-full bg-slate-900/70 group-hover:scale-125 transition" />
            </Link>

            {/* משני: קו מתאר שחור עם נגיעת צהוב */}
            <Link
              href="/business"
              className="group relative inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5
                         font-semibold text-slate-900 bg-white hover:bg-slate-50
                         ring-1 ring-inset ring-slate-300 shadow-sm transition"
            >
              כניסת מנוי — חברה
              <span className="absolute left-4 h-2 w-2 rounded-full bg-yellow-300 group-hover:scale-125 transition" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
