'use client';

import Link from 'next/link';
import Image from 'next/image';
import React from 'react';

type AppHeaderProps = {
  subtitle?: string;
  homeHref?: string;
  onLogoClick?: () => void;
  logoSrc?: string;              // לדוגמה: /logo.png
  variant?: 'yellow' | 'blue';
  className?: string;
};

export default function AppHeader({
  subtitle,
  homeHref,
  onLogoClick,
  logoSrc = '/logo.jpg',
  variant = 'yellow',
  className = '',
}: AppHeaderProps) {
  const theme =
    variant === 'yellow'
      ? {
        topBar: 'from-amber-400 to-yellow-300',
        first: 'bg-gradient-to-r from-amber-600 to-yellow-400 bg-clip-text text-transparent',
        second: 'text-slate-900',
      }
      : {
        topBar: 'from-blue-700 to-blue-500',
        first: 'bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent',
        second: 'text-slate-900',
      };

  const Wordmark = (
    <span className="text-3xl sm:text-[34px] font-extrabold leading-none tracking-tight select-none">
      {/* <span className={theme.first}>Car</span> */}
      <span className={theme.second}>Shine Truck Wash</span>
    </span>
  );

  // מילה קליקה-בל
  const ClickableWordmark = onLogoClick ? (
    <button
      onClick={onLogoClick}
      aria-label="מעבר לדף הבית"
      className="hover:opacity-95 active:scale-[.98] transition"
    >
      {Wordmark}
    </button>
  ) : homeHref ? (
    <Link href={homeHref} aria-label="מעבר לדף הבית" className="hover:opacity-95 transition">
      {Wordmark}
    </Link>
  ) : (
    <div className="pointer-events-none">{Wordmark}</div>
  );

  // לוגו קליקה-בל (חדש)
  const LogoImg = (
    <Image
      src={logoSrc}
      alt="לוגו"
      width={60}
      height={60}
      className="object-contain h-14 w-auto sm:h-16"
      priority
    />
  );

  const ClickableLogo = onLogoClick ? (
    <button
      onClick={onLogoClick}
      aria-label="מעבר לדף הבית"
      className="hover:opacity-95 active:scale-[.98] transition"
    >
      {LogoImg}
    </button>
  ) : homeHref ? (
    <Link href={homeHref} aria-label="מעבר לדף הבית" className="block hover:opacity-95 transition">
      {LogoImg}
    </Link>
  ) : (
    <div className="pointer-events-none">{LogoImg}</div>
  );

  return (
    <header className={`shrink-0 ${className}`} dir="rtl">
      {/* רצועה עליונה – הלוגו כעת קליקבילי */}
      <div className={`relative h-20 sm:h-24 w-full rounded-b-3xl bg-gradient-to-l ${theme.topBar}`}>
        <div className="absolute inset-0 grid place-items-center">{ClickableLogo}</div>
      </div>

      {/* כיתוב CarClean מתחת לרצועה */}
      <div className="px-6 sm:px-8 pt-4 pb-1 text-center">
        {ClickableWordmark}
        {subtitle ? <div className="text-xs text-slate-500 mt-2">{subtitle}</div> : null}
      </div>
    </header>
  );
}
