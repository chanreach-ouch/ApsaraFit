'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { Scissors, ShieldCheck, Heart, Sparkles, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  const { t, language } = useLanguage();

  return (
    <footer className="bg-slate-950 border-t border-amber-500/20 text-slate-400 py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Philosophy */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                <Scissors className="w-5 h-5 text-amber-400" />
              </div>
              <span className="font-extrabold text-lg text-white">
                {t('brand.name')}
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md mb-6">
              {language === 'km'
                ? 'ហាងកាត់ដេរសូត្រប្រពៃណីខ្មែរម៉ាក់ រួមបញ្ចូលបច្ចេកវិទ្យាកុំព្យូទ័រ 3D និង MediaPipe AI ដើម្បីវាស់កាត់រាងកាយយ៉ាងជាក់លាក់បំផុត សម្រាប់អតិថិជនរស់នៅក្រៅប្រទេស ឬតាមបណ្តាខេត្តនានា ដោយមិនចាំបាច់ធ្វើដំណើរមកកាន់ហាងផ្ទាល់។'
                : "Mom's Traditional Tailor Shop preserves three generations of master Cambodian silk couture while pioneering browser-native 3D anthropometric body scanning. Precision millimeter garment cutting tailored directly from your camera."}
            </p>
            <div className="flex items-center gap-3 text-xs text-emerald-400 font-mono">
              <ShieldCheck className="w-4 h-4" />
              <span>{t('wizard.privacy_badge')}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-amber-300 uppercase tracking-wider mb-4">
              {language === 'km' ? 'តំណភ្ជាប់រហ័ស' : 'Navigation'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-amber-400 transition">
                  {t('nav.storefront')}
                </Link>
              </li>
              <li>
                <Link href="/measure" className="hover:text-amber-400 transition">
                  {t('nav.measure')}
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-amber-400 transition">
                  {t('nav.admin')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Atelier Contact */}
          <div>
            <h4 className="text-sm font-bold text-amber-300 uppercase tracking-wider mb-4">
              {language === 'km' ? 'ទីតាំង & ទំនាក់ទំនង' : 'Atelier & Contact'}
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>#42 Street 240, Daun Penh, Phnom Penh, Kingdom of Cambodia</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>+855 12 345 678 (Telegram / WhatsApp)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            © {new Date().getFullYear()} {t('brand.name')} & ApsaraFit Studio. All rights reserved.
          </div>
          <div className="flex items-center gap-1">
            <span>Handcrafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for Khmer Silk Heritage & Modern Computer Vision</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
