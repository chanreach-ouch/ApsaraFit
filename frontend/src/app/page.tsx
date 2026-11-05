'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Garment } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import GarmentCard from '@/components/GarmentCard';
import {
  Sparkles,
  Scissors,
  Ruler,
  ShieldCheck,
  ChevronRight,
  Camera,
  Layers,
  ArrowRight,
  Flame,
  Award,
  Clock
} from 'lucide-react';

export default function StorefrontPage() {
  const { t, language } = useLanguage();
  const [garments, setGarments] = useState<Garment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchGarments = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/garments');
        if (res.ok) {
          const data = await res.json();
          setGarments(data);
        }
      } catch (err) {
        console.warn("Backend API fetching fallback:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGarments();
  }, []);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden pt-12 pb-24 border-b border-amber-500/20 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(217,119,6,0.22),rgba(2,6,23,0))]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-6 shadow-inner">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{t('hero.badge')}</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight max-w-4xl leading-[1.15]">
            {t('hero.title_pre')}{' '}
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-600 bg-clip-text text-transparent drop-shadow-sm">
              {t('hero.title_highlight')}
            </span>
          </h1>

          {/* Description */}
          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
            {t('hero.description')}
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/measure"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-slate-950 font-extrabold text-base shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-105 active:scale-95 transition duration-200"
            >
              <Camera className="w-5 h-5 text-slate-950" />
              <span>{t('hero.cta_measure')}</span>
              <ChevronRight className="w-5 h-5" />
            </Link>

            <a
              href="#catalog"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/40 text-amber-200 font-bold text-base transition duration-200"
            >
              <Scissors className="w-5 h-5 text-amber-400" />
              <span>{t('hero.cta_catalog')}</span>
            </a>
          </div>

          {/* Key Metrics / Highlights */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl">
            <div className="bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-md">
              <div className="text-2xl font-black text-amber-400 font-mono">
                {t('hero.stat1_val')}
              </div>
              <div className="text-xs text-slate-400 font-medium mt-1">
                {t('hero.stat1_lbl')}
              </div>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-md">
              <div className="text-2xl font-black text-emerald-400 font-mono">
                {t('hero.stat2_val')}
              </div>
              <div className="text-xs text-slate-400 font-medium mt-1">
                {t('hero.stat2_lbl')}
              </div>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-md">
              <div className="text-2xl font-black text-cyan-400 font-mono">
                {t('hero.stat3_val')}
              </div>
              <div className="text-xs text-slate-400 font-medium mt-1">
                {t('hero.stat3_lbl')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Guided Process */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            {t('how.title')}
          </h2>
          <div className="w-20 h-1 bg-amber-500 mx-auto mt-4 rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="relative bg-slate-900/60 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between hover:border-amber-500/40 transition duration-300">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6">
                <Ruler className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {t('how.step1_title')}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {t('how.step1_desc')}
              </p>
            </div>
            <div className="mt-8 text-xs font-mono text-amber-400/80 flex items-center gap-1.5">
              <span>Metric Calibration</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative bg-slate-900/60 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between hover:border-amber-500/40 transition duration-300">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6">
                <Camera className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {t('how.step2_title')}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {t('how.step2_desc')}
              </p>
            </div>
            <div className="mt-8 text-xs font-mono text-emerald-400/80 flex items-center gap-1.5">
              <span>MediaPipe Pose Gatekeeper</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative bg-slate-900/60 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between hover:border-amber-500/40 transition duration-300">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6">
                <Scissors className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {t('how.step3_title')}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {t('how.step3_desc')}
              </p>
            </div>
            <div className="mt-8 text-xs font-mono text-cyan-400/80 flex items-center gap-1.5">
              <span>Digital Cutting Pattern Ticket</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* Traditional Garment Catalog */}
      <section id="catalog" className="py-20 w-full bg-slate-950/60 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-xs text-amber-400 font-mono mb-3">
              <Layers className="w-3.5 h-3.5" />
              <span>{language === 'km' ? 'សូត្រខ្មែរប្រពៃណី' : 'Cambodian Heritage Portfolio'}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white">
              {t('catalog.title')}
            </h2>
            <p className="text-slate-400 mt-4 text-sm sm:text-base leading-relaxed">
              {t('catalog.subtitle')}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-96 bg-slate-900/60 rounded-2xl border border-slate-800 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {garments.map((garment) => (
                <GarmentCard key={garment.id} garment={garment} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Traditional Craftsmanship & Privacy Guarantee */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-8 sm:p-14 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-mono uppercase tracking-widest mb-3">
              <Award className="w-4 h-4" />
              <span>Three Generations of Master Tailoring</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
              {language === 'km'
                ? 'សាច់ក្រណាត់សូត្រធម្មជាតិ មិនមានភាពយឺត ទាមទារកម្រិតធូរ (Ease) ដ៏ត្រឹមត្រូវ'
                : 'Raw Cambodian Silk has zero stretch. Precision pattern ease makes all the difference.'}
            </h3>
            <p className="text-sm text-slate-300 mt-4 leading-relaxed">
              {language === 'km'
                ? 'ជាងកាត់ដេររបស់យើងគណនាកម្រិតធូរស្វ័យប្រវត្តិតាមប្រភេទសម្លៀកបំពាក់នីមួយៗ (+៣.០ ស.ម ដើមទ្រូង, +២.០ ស.ម ចង្កេះ, +១.៥ ស.ម ដើមដៃ) ដើម្បីធានាថាស្លៀកទៅស្រួលខ្លួន មិនតឹង និងមិនរលុង។'
                : 'Every millimeter counts. Non-stretch silk blouses automatically add +3.0 cm ease to the bust and +2.0 cm to the waist, ensuring complete freedom of movement while preserving an unbroken sculptured silhouette.'}
            </p>
          </div>

          <div className="shrink-0 flex flex-col items-center sm:items-start gap-4">
            <Link
              href="/measure"
              className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-2xl shadow-xl transition active:scale-95 flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>{t('hero.cta_measure')}</span>
            </Link>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
              <ShieldCheck className="w-4 h-4" />
              <span>Zero-Storage Privacy Guaranteed</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
