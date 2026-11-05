'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { Scissors, Sparkles, Globe, PhoneCall } from 'lucide-react';

export default function Navbar() {
  const { language, setLanguage, t } = useLanguage();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-md border-b border-amber-500/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-600 to-amber-700 p-0.5 shadow-md shadow-amber-500/20 group-hover:scale-105 transition">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Scissors className="w-6 h-6 text-amber-400 group-hover:rotate-12 transition duration-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl text-white tracking-tight group-hover:text-amber-300 transition">
                {t('brand.name')}
              </span>
              <span className="text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                3D AI
              </span>
            </div>
            <div className="text-xs text-amber-400/80 font-medium">
              {t('brand.subtitle')}
            </div>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-full border border-slate-800">
          <Link
            href="/"
            className={`px-4 py-2 rounded-full text-xs font-semibold transition ${
              pathname === '/'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            {t('nav.storefront')}
          </Link>

          <Link
            href="/measure"
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition ${
              pathname === '/measure'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('nav.measure')}</span>
          </Link>

          <Link
            href="/admin"
            className={`px-4 py-2 rounded-full text-xs font-semibold transition ${
              pathname === '/admin'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            {t('nav.admin')}
          </Link>
        </nav>

        {/* Right Section: Language Switcher & Contact */}
        <div className="flex items-center gap-3">
          {/* Language Toggle Pill */}
          <div className="flex items-center bg-slate-900 border border-amber-500/30 rounded-full p-1 text-xs">
            <button
              onClick={() => setLanguage('km')}
              className={`px-2.5 py-1 rounded-full transition font-khmer font-bold ${
                language === 'km'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="ភាសាខ្មែរ (Khmer)"
            >
              ភាសាខ្មែរ
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-full transition font-semibold ${
                language === 'en'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="English"
            >
              EN
            </button>
          </div>

          {/* Direct Atelier Button */}
          <a
            href="tel:+85512345678"
            className="hidden lg:flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/40 rounded-full text-xs text-amber-300 transition"
          >
            <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono">+855 12 345 678</span>
          </a>
        </div>
      </div>
    </header>
  );
}
