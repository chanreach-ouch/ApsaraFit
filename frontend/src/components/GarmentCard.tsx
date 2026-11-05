'use client';

import React from 'react';
import Link from 'next/link';
import { Garment } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { Scissors, Sparkles, Check, ChevronRight } from 'lucide-react';

interface GarmentCardProps {
  garment: Garment;
  selected?: boolean;
  onSelect?: (garment: Garment) => void;
}

export default function GarmentCard({ garment, selected, onSelect }: GarmentCardProps) {
  const { language, t } = useLanguage();

  const name = language === 'km' ? garment.name_km : garment.name_en;
  const description = language === 'km' ? garment.description_km : garment.description_en;

  return (
    <div
      className={`group relative bg-slate-900/80 rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 ${
        selected
          ? 'border-amber-400 ring-2 ring-amber-400/40'
          : 'border-slate-800 hover:border-amber-500/50'
      }`}
    >
      {/* Garment Image with Traditional Silk Gradient */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-950">
        <img
          src={garment.image_url}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

        {/* Category & Price Badge */}
        <div className="absolute top-3 left-3">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider bg-slate-950/80 backdrop-blur-md text-amber-300 px-3 py-1 rounded-full border border-amber-500/30 shadow">
            {garment.category}
          </span>
        </div>

        <div className="absolute bottom-3 right-3">
          <span className="text-sm font-extrabold text-white bg-amber-600/90 backdrop-blur-md px-3 py-1 rounded-xl shadow-lg border border-amber-400/40">
            ${garment.price_usd} USD
          </span>
        </div>
      </div>

      {/* Garment Info */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition line-clamp-1">
            {name}
          </h3>
          <p className="text-xs text-amber-400/90 font-medium mt-1">
            {t('garment.fabric')}: {garment.fabric_type}
          </p>
          <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
            {description}
          </p>

          {/* Ease Rules Preview */}
          <div className="mt-4 pt-4 border-t border-slate-800/80">
            <div className="text-[11px] font-semibold text-amber-200/90 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('garment.ease_rules')}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(garment.ease_rules).slice(0, 3).map(([key, easeMm]) => (
                <span
                  key={key}
                  className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700"
                >
                  {t(`meas.${key}`)}: +{(easeMm / 10).toFixed(1)}cm
                </span>
              ))}
              {Object.keys(garment.ease_rules).length > 3 && (
                <span className="text-[10px] text-amber-400/80 font-mono py-0.5">
                  +{Object.keys(garment.ease_rules).length - 3} more
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 pt-3">
          {onSelect ? (
            <button
              onClick={() => onSelect(garment)}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                selected
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 active:scale-98'
              }`}
            >
              {selected ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>{t('garment.selected')}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{t('garment.select')}</span>
                </>
              )}
            </button>
          ) : (
            <Link
              href={`/measure?garmentId=${garment.id}`}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center justify-center gap-2 group-hover:bg-amber-400 shadow-md active:scale-98"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t('garment.select')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
