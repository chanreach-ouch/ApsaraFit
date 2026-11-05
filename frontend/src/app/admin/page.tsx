'use client';

import React, { useEffect, useState } from 'react';
import { Order, OrderMeasurement } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import TailorCuttingTicket from '@/components/TailorCuttingTicket';
import MannequinViewer from '@/components/MannequinViewer';
import {
  Scissors,
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Printer,
  Sparkles,
  Phone,
  RefreshCw,
  Eye
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { t, language } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeRingKey, setActiveRingKey] = useState<string | null>('chest');
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://127.0.0.1:8000/api/orders');
      if (res.ok) {
        const data: Order[] = await res.json();
        setOrders(data);
        if (data.length > 0 && !selectedOrder) {
          setSelectedOrder(data[0]);
        } else if (selectedOrder) {
          const updated = data.find((o) => o.id === selectedOrder.id);
          if (updated) setSelectedOrder(updated);
        }
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Update order status (e.g. PENDING_REVIEW -> IN_CUTTING)
  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: updated.status } : o)));
        if (selectedOrder?.id === orderId) {
          setSelectedOrder((prev) => prev ? { ...prev, status: updated.status } : null);
        }
      }
    } catch (err) {
      console.error("Error updating order status:", err);
    }
  };

  // Interactive Ease rule update
  const handleUpdateEase = async (measurementId: number, newEaseCm: number) => {
    if (!selectedOrder) return;
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/orders/${selectedOrder.id}/measurements/${measurementId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ease_cm: newEaseCm }),
        }
      );
      if (res.ok) {
        const updatedMeas: OrderMeasurement = await res.json();
        setSelectedOrder((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            measurements: prev.measurements.map((m) => (m.id === measurementId ? updatedMeas : m)),
          };
        });
      }
    } catch (err) {
      console.error("Error updating measurement ease:", err);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = filterStatus === 'ALL' || o.status === filterStatus;
    const matchesSearch =
      o.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.ticket_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer_phone.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Dashboard Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-xs text-amber-300 font-mono mb-2">
            <Scissors className="w-3.5 h-3.5 text-amber-400" />
            <span>Master Atelier Operating System</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            {t('admin.title')}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t('admin.subtitle')}
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl text-xs font-semibold transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Orders</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Orders Queue (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-white text-sm">
              <Users className="w-4 h-4 text-amber-400" />
              <span>{t('admin.orders_queue')} ({filteredOrders.length})</span>
            </div>

            {/* Filter Dropdown */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-amber-300 text-[11px] rounded-lg px-2 py-1"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING_REVIEW">Pending Review</option>
              <option value="IN_CUTTING">In Cutting</option>
              <option value="SEWING">Sewing</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search name, ticket #, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white"
            />
          </div>

          {/* Orders List */}
          <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-500">
                No orders matching filter.
              </div>
            ) : (
              filteredOrders.map((order) => {
                const isSelected = selectedOrder?.id === order.id;
                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-400/80 shadow-md ring-1 ring-amber-400/30'
                        : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-amber-400">
                        {order.ticket_number}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          order.status === 'IN_CUTTING'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : order.status === 'COMPLETED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-white line-clamp-1">
                      {order.customer_name}
                    </div>

                    <div className="text-[11px] text-amber-300/80 line-clamp-1 font-medium">
                      {order.garment ? (language === 'km' ? order.garment.name_km : order.garment.name_en) : 'Bespoke Garment'}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/60 font-mono">
                      <span>{order.customer_phone}</span>
                      <span>{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Order Dual-Column Cutting Ticket & 3D Mannequin Inspector (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {selectedOrder ? (
            <>
              {/* Order Status Control Strip */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 no-print">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Status Workflow:</span>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                    className="bg-slate-950 border border-amber-500/40 text-amber-300 font-bold text-xs rounded-xl px-3 py-1.5 focus:outline-none"
                  >
                    <option value="PENDING_REVIEW">PENDING REVIEW</option>
                    <option value="IN_CUTTING">IN CUTTING (កំពុងកាត់)</option>
                    <option value="SEWING">SEWING (កំពុងដេរ)</option>
                    <option value="COMPLETED">COMPLETED (រួចរាល់)</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-400">Garment Ease Applied:</span>
                  <span className="font-mono text-emerald-400 font-bold">Automatic + Non-Stretch Silk Rules</span>
                </div>
              </div>

              {/* 3D Client Mannequin Inspector */}
              {selectedOrder.mesh_data && (
                <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-5 shadow-xl no-print">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <h3 className="text-sm font-bold text-white">
                        {t('admin.interactive_mannequin')} ({selectedOrder.customer_name})
                      </h3>
                    </div>
                    <span className="text-[11px] text-amber-300 font-mono">
                      Stature: {(selectedOrder.height_mm / 10).toFixed(1)} cm
                    </span>
                  </div>

                  <MannequinViewer
                    meshData={selectedOrder.mesh_data}
                    activeRingKey={activeRingKey}
                    onRingSelect={(name) => setActiveRingKey(name)}
                    className="w-full h-[400px]"
                  />
                </div>
              )}

              {/* Master Dual-Column Tailor Cutting Ticket */}
              <TailorCuttingTicket
                order={selectedOrder}
                selectedKey={activeRingKey}
                onSelectKey={(key) => setActiveRingKey(key)}
                onUpdateEase={handleUpdateEase}
              />
            </>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center text-slate-500">
              Select an order from the queue to view its cutting card and 3D mannequin.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
