'use client';

import React, { useState } from 'react';
import { Order, OrderMeasurement } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { Printer, Scissors, Sparkles, User, Phone, Calendar, Edit3, Save } from 'lucide-react';

interface TailorCuttingTicketProps {
  order: Order;
  selectedKey?: string | null;
  onSelectKey?: (key: string) => void;
  onUpdateEase?: (measurementId: number, newEaseCm: number) => Promise<void>;
}

export default function TailorCuttingTicket({
  order,
  selectedKey,
  onSelectKey,
  onUpdateEase,
}: TailorCuttingTicketProps) {
  const { language, t } = useLanguage();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [saving, setSaving] = useState<boolean>(false);

  const handlePrint = () => {
    window.print();
  };

  const startEdit = (m: OrderMeasurement) => {
    setEditingId(m.id);
    setEditValue(m.ease_cm);
  };

  const saveEdit = async (m: OrderMeasurement) => {
    if (!onUpdateEase) return;
    try {
      setSaving(true);
      await onUpdateEase(m.id, editValue);
      setEditingId(null);
    } catch (err) {
      console.error("Failed to update ease:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-2xl printable-ticket">
      {/* Ticket Header & Print Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
              {order.ticket_number}
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">
              {order.status}
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-2">
            {language === 'km' ? 'សន្លឹកកាត់ដេរឌីជីថលម៉ាក់' : "Mom's Master Tailor Cutting Ticket"}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {language === 'km' ? 'ទំហំកាត់ក្រណាត់គិតជា ស.ម និង អុីញ (Inches) សម្រាប់ជាងកាត់ដេរ' : 'Direct Pattern Cut Dimensions with Applied Fabric Ease Rules'}
          </p>
        </div>

        {/* Print Button (hidden on print) */}
        <button
          onClick={handlePrint}
          className="no-print flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg transition active:scale-95"
        >
          <Printer className="w-4 h-4 text-slate-950" />
          <span>{t('admin.print_ticket')}</span>
        </button>
      </div>

      {/* Client & Garment Meta Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 py-5 border-b border-slate-800 text-xs">
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <div className="text-slate-400 flex items-center gap-1.5 mb-1">
            <User className="w-3.5 h-3.5 text-amber-400" />
            <span>Customer</span>
          </div>
          <div className="font-bold text-white text-sm">{order.customer_name}</div>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <div className="text-slate-400 flex items-center gap-1.5 mb-1">
            <Phone className="w-3.5 h-3.5 text-amber-400" />
            <span>Phone / Telegram</span>
          </div>
          <div className="font-bold text-amber-300 font-mono text-sm">
            {order.customer_phone} {order.customer_telegram ? `(${order.customer_telegram})` : ''}
          </div>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <div className="text-slate-400 flex items-center gap-1.5 mb-1">
            <Scissors className="w-3.5 h-3.5 text-amber-400" />
            <span>Garment Chosen</span>
          </div>
          <div className="font-bold text-white text-sm">
            {order.garment ? (language === 'km' ? order.garment.name_km : order.garment.name_en) : 'Custom Bespoke'}
          </div>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <div className="text-slate-400 flex items-center gap-1.5 mb-1">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Stature & Date</span>
          </div>
          <div className="font-bold text-white text-sm">
            {(order.height_mm / 10).toFixed(1)} cm • {new Date(order.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>

      {order.customer_notes && (
        <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-200">
          <span className="font-bold mr-1">Atelier Note:</span> {order.customer_notes}
        </div>
      )}

      {/* Dual-Column Cutting Card Table */}
      <div className="mt-6 overflow-x-auto">
        <div className="text-xs text-slate-400 mb-2 flex items-center gap-1.5 no-print">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>{t('admin.click_hint')}</span>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-950 text-slate-300 text-xs uppercase tracking-wider font-semibold">
              <th className="py-3 px-4">{t('admin.col_meas')}</th>
              <th className="py-3 px-4">{t('admin.col_skin')}</th>
              <th className="py-3 px-4">{t('admin.col_ease')}</th>
              <th className="py-3 px-4 bg-amber-950/40 border-l border-amber-500/30 text-amber-300">
                {t('admin.col_cut')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-xs">
            {order.measurements.map((m) => {
              const isSelected = selectedKey === m.measurement_key;
              const isEditing = editingId === m.id;

              return (
                <tr
                  key={m.id}
                  onClick={() => onSelectKey && onSelectKey(m.measurement_key)}
                  className={`cursor-pointer transition duration-150 ${
                    isSelected
                      ? 'bg-amber-500/20 text-white font-semibold'
                      : 'hover:bg-slate-800/60 text-slate-300'
                  }`}
                >
                  {/* Column 1: Measurement Name (Khmer + EN) */}
                  <td className="py-3.5 px-4 font-medium">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-cyan-400' : 'bg-transparent'}`} />
                      <div>
                        <div className="text-white font-khmer text-sm">{m.name_km}</div>
                        <div className="text-[11px] text-slate-400">{m.name_en}</div>
                      </div>
                    </div>
                  </td>

                  {/* Column 2: Exact Body Skin Measurement */}
                  <td className="py-3.5 px-4 font-mono">
                    <span className="font-bold text-slate-200">{m.skin_value_cm} cm</span>
                    <span className="text-[11px] text-slate-400 block">
                      ({m.skin_value_in}&quot; / {m.skin_value_mm} mm)
                    </span>
                  </td>

                  {/* Column 3: Fabric Ease Rule (Editable) */}
                  <td className="py-3.5 px-4 font-mono" onClick={(e) => e.stopPropagation()}>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.5"
                          value={editValue}
                          onChange={(e) => setEditValue(parseFloat(e.target.value) || 0)}
                          className="w-16 px-2 py-1 bg-slate-950 border border-amber-400 rounded text-amber-300 text-xs font-mono"
                        />
                        <span className="text-xs text-slate-400">cm</span>
                        <button
                          onClick={() => saveEdit(m)}
                          disabled={saving}
                          className="p-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded transition"
                          title="Save Ease Rule"
                        >
                          <Save className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-amber-300 font-semibold">
                          +{m.ease_cm} cm
                        </span>
                        <button
                          onClick={() => startEdit(m)}
                          className="no-print p-1 text-slate-400 hover:text-amber-400 transition"
                          title="Edit Ease Rule"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </td>

                  {/* Column 4: Final Pattern Cut (Highlighted in bold for tailor's tape measure) */}
                  <td className="py-3.5 px-4 font-mono bg-amber-950/20 border-l border-amber-500/30">
                    <div className="text-base font-black text-amber-300">
                      {m.pattern_cut_cm} cm
                    </div>
                    <div className="text-xs font-bold text-amber-400/90">
                      {m.pattern_cut_in} inches
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Print Footer / Tailor Signature Block */}
      <div className="mt-8 pt-6 border-t border-slate-800 grid grid-cols-2 gap-8 text-xs text-slate-400 print-only">
        <div>
          <div className="font-semibold text-slate-300">Master Tailor Inspection:</div>
          <div className="mt-6 border-b border-slate-600 w-48" />
          <div className="mt-1 text-[10px]">Mom’s Traditional Tailor Studio</div>
        </div>
        <div className="text-right">
          <div className="font-semibold text-slate-300">Garment Ready Date:</div>
          <div className="mt-6 border-b border-slate-600 w-48 ml-auto" />
          <div className="mt-1 text-[10px]">Phnom Penh Atelier</div>
        </div>
      </div>
    </div>
  );
}
