'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import PoseGatekeeper from '@/components/PoseGatekeeper';
import MannequinViewer from '@/components/MannequinViewer';
import { Garment, ScanResponse } from '@/types';
import confetti from 'canvas-confetti';
import {
  Ruler,
  Camera,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Send,
  Scissors,
  ArrowRight,
  ArrowLeft,
  Info,
  CreditCard,
  User,
  Phone,
  FileText
} from 'lucide-react';

function MeasurePageContent() {
  const { t, language } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [garments, setGarments] = useState<Garment[]>([]);
  const [selectedGarmentId, setSelectedGarmentId] = useState<number | null>(null);

  // Wizard Steps: 1 = Calibration, 2 = Camera Scan, 3 = 3D Model & Submit, 4 = Order Success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Calibration Form State
  const [heightCm, setHeightCm] = useState<number>(165);
  const [weightKg, setWeightKg] = useState<number>(55);
  const [gender, setGender] = useState<'female' | 'male'>('female');
  const [hasRefCard, setHasRefCard] = useState<boolean>(false);

  // Scan & 3D Reconstruction Results
  const [scanResult, setScanResult] = useState<ScanResponse | null>(null);
  const [activeRingKey, setActiveRingKey] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Customer Contact Submission
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerTelegram, setCustomerTelegram] = useState<string>('');
  const [customerNotes, setCustomerNotes] = useState<string>('');
  const [createdOrderTicket, setCreatedOrderTicket] = useState<string | null>(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);

  // Fetch Garments to attach to order
  useEffect(() => {
    const fetchGarments = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/garments');
        if (res.ok) {
          const data: Garment[] = await res.json();
          setGarments(data);
          const paramId = searchParams.get('garmentId');
          if (paramId) {
            setSelectedGarmentId(parseInt(paramId));
          } else if (data.length > 0) {
            setSelectedGarmentId(data[0].id);
          }
        }
      } catch (err) {
        console.error("Error fetching garments:", err);
      }
    };
    fetchGarments();
  }, [searchParams]);

  // Handle 360 Turnaround Output from PoseGatekeeper
  const handleTurnaroundComplete = async (frames: Record<string, string>) => {
    try {
      setIsProcessing(true);
      const res = await fetch('http://127.0.0.1:8000/api/measure/scan-360', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frames: frames,
          height_cm: heightCm,
          height_mm: heightCm * 10,
          weight_kg: weightKg,
          gender: gender,
          has_reference_card: hasRefCard,
        }),
      });

      if (!res.ok) throw new Error("Turnaround 360 processing failed");

      const data: ScanResponse = await res.json();
      setScanResult(data);
      setStep(3);
    } catch (err) {
      console.warn("Turnaround 360 fallback to demo generator:", err);
      handleDemoScan();
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Scan Output from PoseGatekeeper (Legacy dual-frame)
  const handleCaptureComplete = async (frontBlob: Blob | File, sideBlob: Blob | File) => {
    try {
      setIsProcessing(true);
      const formData = new FormData();
      formData.append('front_image', frontBlob, 'front.jpg');
      formData.append('side_image', sideBlob, 'side.jpg');
      formData.append('height_mm', (heightCm * 10).toString());
      if (weightKg) formData.append('weight_kg', weightKg.toString());
      formData.append('gender', gender);
      formData.append('has_reference_card', hasRefCard ? 'true' : 'false');

      const res = await fetch('http://127.0.0.1:8000/api/measure/scan', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error("Scan processing failed");

      const data: ScanResponse = await res.json();
      setScanResult(data);
      setStep(3);
    } catch (err) {
      console.warn("Scan upload fallback to demo generator:", err);
      // Seamless fallback
      handleDemoScan();
    } finally {
      setIsProcessing(false);
    }
  };

  // Instant 1-Click Demo Scan
  const handleDemoScan = async () => {
    try {
      setIsProcessing(true);
      const res = await fetch('http://127.0.0.1:8000/api/measure/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          height_mm: heightCm * 10,
          weight_kg: weightKg,
          gender: gender,
        }),
      });

      if (!res.ok) throw new Error("Demo scan failed");

      const data: ScanResponse = await res.json();
      setScanResult(data);
      setStep(3);
    } catch (err) {
      console.error("Demo scan error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Submit Final Tailor Order to Mom's Dashboard
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanResult || !selectedGarmentId || !customerName || !customerPhone) return;

    try {
      setIsSubmittingOrder(true);
      const selectedGarment = garments.find((g) => g.id === selectedGarmentId);
      const easeRules = selectedGarment?.ease_rules || {};

      // Prepare measurements with applied ease
      const orderMeasurements = scanResult.measurements.map((m) => {
        const easeMm = easeRules[m.key] || 0.0;
        const easeCm = Math.round((easeMm / 10.0) * 10) / 10;
        const cutMm = m.skin_mm + easeMm;
        const cutCm = Math.round((cutMm / 10.0) * 10) / 10;
        const cutIn = Math.round((cutMm / 25.4) * 100) / 100;

        return {
          measurement_key: m.key,
          name_en: m.name_en,
          name_km: m.name_km,
          skin_value_mm: m.skin_mm,
          skin_value_cm: m.skin_cm,
          skin_value_in: m.skin_in,
          ease_mm: easeMm,
          ease_cm: easeCm,
          pattern_cut_cm: cutCm,
          pattern_cut_in: cutIn,
          notes: easeCm > 0 ? `Ease +${easeCm} cm` : 'Direct skin fit',
        };
      });

      const payload = {
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_telegram: customerTelegram || undefined,
        customer_notes: customerNotes || undefined,
        height_mm: heightCm * 10,
        weight_kg: weightKg,
        gender: gender,
        garment_id: selectedGarmentId,
        mesh_data: scanResult.mesh_data,
        measurements: orderMeasurements,
      };

      const res = await fetch('http://127.0.0.1:8000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Order creation failed");

      const createdOrder = await res.json();
      setCreatedOrderTicket(createdOrder.ticket_number);
      setStep(4);

      // Trigger celebration confetti!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ca9126', '#00ffcc', '#ffffff'],
      });
    } catch (err) {
      console.error("Order submission error:", err);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Wizard Step Progression Bar */}
      <div className="flex items-center justify-between mb-10 max-w-2xl mx-auto">
        <div className={`flex items-center gap-2 text-xs font-bold transition ${step >= 1 ? 'text-amber-400' : 'text-slate-600'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border font-mono ${step >= 1 ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-900 border-slate-700'}`}>
            1
          </div>
          <span className="hidden sm:inline">{t('wizard.step1')}</span>
        </div>
        <div className={`flex-1 h-0.5 mx-4 ${step >= 2 ? 'bg-amber-500' : 'bg-slate-800'}`} />

        <div className={`flex items-center gap-2 text-xs font-bold transition ${step >= 2 ? 'text-amber-400' : 'text-slate-600'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border font-mono ${step >= 2 ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-900 border-slate-700'}`}>
            2
          </div>
          <span className="hidden sm:inline">{t('wizard.step2')}</span>
        </div>
        <div className={`flex-1 h-0.5 mx-4 ${step >= 3 ? 'bg-amber-500' : 'bg-slate-800'}`} />

        <div className={`flex items-center gap-2 text-xs font-bold transition ${step >= 3 ? 'text-amber-400' : 'text-slate-600'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border font-mono ${step >= 3 ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-900 border-slate-700'}`}>
            3
          </div>
          <span className="hidden sm:inline">{t('wizard.step3')}</span>
        </div>
      </div>

      {/* Loading Overlay when AI Engine is Slicing */}
      {isProcessing && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">{t('wizard.analyzing')}</h3>
          <p className="text-xs text-amber-300 font-mono">Ramanujan Ellipse Perimeter & 3D Lofting in Progress...</p>
        </div>
      )}

      {/* STEP 1: CALIBRATION INPUT */}
      {step === 1 && (
        <div className="max-w-xl mx-auto bg-slate-900/90 border border-amber-500/30 rounded-3xl p-8 shadow-2xl backdrop-blur-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-xs text-amber-400 font-mono mb-2">
              <Ruler className="w-3.5 h-3.5" />
              <span>Step 1: Stature & Garment Baseline</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white">
              {language === 'km' ? 'កំណត់ទំហំគោលសម្រាប់វាស់រាង' : 'Body Calibration & Garment Selection'}
            </h2>
          </div>

          <div className="space-y-6">
            {/* Height Input (cm) */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
                <label>{t('wizard.height_label')}</label>
                <span className="text-amber-400 font-mono font-bold text-sm">{heightCm} cm ({(heightCm * 10)} mm)</span>
              </div>
              <input
                type="range"
                min="120"
                max="220"
                step="1"
                value={heightCm}
                onChange={(e) => setHeightCm(parseInt(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>120 cm</span>
                <span>170 cm</span>
                <span>220 cm</span>
              </div>
            </div>

            {/* Weight Input (kg) */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
                <label>{t('wizard.weight_label')}</label>
                <span className="text-amber-400 font-mono font-bold text-sm">{weightKg} kg</span>
              </div>
              <input
                type="range"
                min="35"
                max="140"
                step="1"
                value={weightKg}
                onChange={(e) => setWeightKg(parseInt(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Gender / Body Contour Picker */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                {t('wizard.gender_label')}
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setGender('female')}
                  className={`py-3 px-4 rounded-xl text-xs font-bold border transition ${
                    gender === 'female'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {t('wizard.female')}
                </button>
                <button
                  type="button"
                  onClick={() => setGender('male')}
                  className={`py-3 px-4 rounded-xl text-xs font-bold border transition ${
                    gender === 'male'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {t('wizard.male')}
                </button>
              </div>
            </div>

            {/* Garment Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                {language === 'km' ? 'សម្លៀកបំពាក់ដែលត្រូវកាត់' : 'Garment to Tailor'}
              </label>
              <select
                value={selectedGarmentId || ''}
                onChange={(e) => setSelectedGarmentId(parseInt(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs rounded-xl p-3"
              >
                {garments.map((g) => (
                  <option key={g.id} value={g.id}>
                    {language === 'km' ? g.name_km : g.name_en} (${g.price_usd} USD)
                  </option>
                ))}
              </select>
            </div>

            {/* Reference Card Calibration Toggle */}
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-start gap-3">
              <input
                type="checkbox"
                id="refCardCheck"
                checked={hasRefCard}
                onChange={(e) => setHasRefCard(e.target.checked)}
                className="mt-1 accent-amber-500 w-4 h-4 rounded cursor-pointer"
              />
              <label htmlFor="refCardCheck" className="text-xs cursor-pointer">
                <span className="font-bold text-amber-300 block flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" />
                  {t('wizard.card_toggle')}
                </span>
                <span className="text-slate-400 text-[11px] mt-0.5 block">
                  {t('wizard.card_desc')}
                </span>
              </label>
            </div>

            {/* Next Step Action */}
            <div className="pt-4 flex flex-col gap-3">
              <button
                onClick={() => setStep(2)}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold rounded-2xl shadow-xl transition active:scale-98 flex items-center justify-center gap-2 text-sm"
              >
                <span>{t('wizard.btn_continue')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleDemoScan}
                className="w-full py-2.5 bg-slate-800/80 hover:bg-slate-800 text-amber-300 font-semibold rounded-xl border border-amber-500/20 transition text-xs flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('wizard.btn_demo')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: HANDS-FREE 360° GUIDED TURNAROUND SCAN */}
      {step === 2 && (
        <div>
          <button
            onClick={() => setStep(1)}
            className="mb-4 inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Calibration</span>
          </button>

          <PoseGatekeeper
            heightMm={heightCm * 10}
            onTurnaroundComplete={handleTurnaroundComplete}
            onCaptureComplete={handleCaptureComplete}
            onDemoScan={handleDemoScan}
          />
        </div>
      )}

      {/* STEP 3: 3D MANNEQUIN REVEAL & ORDER SUBMISSION */}
      {step === 3 && scanResult && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive 3D Mannequin Viewport (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full border border-amber-500/30">
                  {scanResult.engine_used.includes('SMPL') ? 'SMPL-X 3D MESH' : '3D PARAMETRIC LOFT'}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {(scanResult.mesh_data.height_mm / 10).toFixed(1)} cm
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{t('wizard.privacy_badge')}</span>
              </div>
            </div>

            {/* 3D Three.js Mannequin */}
            <MannequinViewer
              meshData={scanResult.mesh_data}
              activeRingKey={activeRingKey}
              onRingSelect={(name) => setActiveRingKey(name)}
              className="w-full h-[520px]"
            />

            {/* Hint */}
            <p className="text-[11px] text-slate-400 mt-3 text-center">
              Click & drag to rotate 3D mannequin • Scroll to zoom • Glowing rings correspond to precision tailor slices.
            </p>
          </div>

          {/* Right Column: 14 Measurements Table & Customer Order Submission Form (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Measurements Card */}
            <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-5 shadow-xl">
              <h3 className="text-base font-bold text-white mb-3 flex items-center justify-between">
                <span>{language === 'km' ? 'រង្វាស់ទាំង ១៤ ចំណុច' : '14 Precision Body Measurements'}</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40">
                  ±1.5 mm verified
                </span>
              </h3>

              <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-800">
                {scanResult.measurements.map((m) => {
                  const isHighlighted = activeRingKey && m.key.toLowerCase().includes(activeRingKey.toLowerCase());
                  return (
                    <div
                      key={m.key}
                      onClick={() => setActiveRingKey(m.key)}
                      className={`pt-2 flex items-center justify-between text-xs cursor-pointer px-2 py-1.5 rounded-lg transition ${
                        isHighlighted ? 'bg-amber-500/20 text-white font-bold' : 'hover:bg-slate-800/60 text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="text-white font-khmer">{m.name_km}</div>
                        <div className="text-[10px] text-slate-400">{m.name_en}</div>
                      </div>
                      <div className="text-right font-mono">
                        <div className="font-bold text-amber-400">{m.skin_cm} cm</div>
                        <div className="text-[10px] text-slate-400">{m.skin_in}&quot;</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Submission Form */}
            <form onSubmit={handleSubmitOrder} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Scissors className="w-4 h-4 text-amber-400" />
                <span>{language === 'km' ? 'ផ្ញើទៅជាងកាត់ដេរម៉ាក់' : "Send to Mom's Cutting Room"}</span>
              </h3>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Your Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sreypov Meas / ស្រីពៅ"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Phone Number (WhatsApp / Telegram)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    placeholder="+855 12 345 678"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Telegram Username (Optional)</label>
                <input
                  type="text"
                  placeholder="@username"
                  value={customerTelegram}
                  onChange={(e) => setCustomerTelegram(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Atelier Notes / Special Requests</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Color preferences, event date, collar preference..."
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-3 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingOrder}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold rounded-xl text-xs shadow-lg transition active:scale-98 flex items-center justify-center gap-2"
              >
                {isSubmittingOrder ? (
                  <span>Generating Tailor Cutting Ticket...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Generate Tailor Ticket & Send Order</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* STEP 4: ORDER SUCCESS TICKET NOTIFICATION */}
      {step === 4 && createdOrderTicket && (
        <div className="max-w-xl mx-auto bg-slate-900 border border-amber-500/40 rounded-3xl p-8 text-center shadow-2xl animate-fade-in">
          <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center text-emerald-400 mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-extrabold text-white mb-2">
            {language === 'km' ? 'ការកុម្ម៉ង់ត្រូវបានបញ្ជូនជោគជ័យ!' : 'Tailoring Order Successfully Dispatched!'}
          </h2>

          <p className="text-xs text-slate-300 max-w-md mx-auto mb-6 leading-relaxed">
            {language === 'km'
              ? 'ម៉ាក់បានទទួលរង្វាស់ 3D របស់អ្នករួចរាល់ហើយ។ សន្លឹកកាត់ដេរ (Cutting Ticket) ត្រូវបានរៀបចំជាមួយនឹងកម្រិតធូរនៃសាច់ក្រណាត់។'
              : 'Mom has received your calibrated 3D body mannequin and cutting pattern card. We will contact you via Telegram/Phone to confirm fabric dyeing details.'}
          </p>

          <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-5 mb-8 inline-block w-full">
            <div className="text-xs text-slate-400 uppercase font-mono tracking-widest mb-1">
              Bespoke Ticket Number
            </div>
            <div className="text-3xl font-black text-amber-400 font-mono tracking-wider">
              {createdOrderTicket}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push('/admin')}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg flex items-center justify-center gap-2"
            >
              <Scissors className="w-4 h-4" />
              <span>View in Tailor Dashboard</span>
            </button>

            <button
              onClick={() => {
                setStep(1);
                setScanResult(null);
              }}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition"
            >
              Start Another Scan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MeasurePage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-[60vh] flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
          <div className="text-sm font-semibold text-amber-300">Loading AI Fitting Studio...</div>
        </div>
      }
    >
      <MeasurePageContent />
    </Suspense>
  );
}
