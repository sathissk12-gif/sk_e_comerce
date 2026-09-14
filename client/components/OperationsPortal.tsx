'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ShieldAlert,
  Building2,
  Truck,
  CheckCircle,
  Bell,
  Clock,
  Printer,
  ChevronRight,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Volume2
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { PrintSlipModal } from './PrintSlipModal';
import { getApiBaseUrl } from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface OperationsPortalProps {
  isOpen: boolean;
  onClose: () => void;
  onTrackOrder: (orderId: string) => void;
}

export const OperationsPortal: React.FC<OperationsPortalProps> = ({
  isOpen,
  onClose,
  onTrackOrder
}) => {
  const { token, user } = useAuth();
  const authHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const [activeTab, setActiveTab] = useState<'ADMIN' | 'GODOWN' | 'DISPATCH'>('ADMIN');
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [printOrder, setPrintOrder] = useState<any | null>(null);
  const [toastNotification, setToastNotification] = useState<{
    orderNumber: string;
    customerName: string;
    finalPayable: number;
  } | null>(null);

  // Dispatch fields state: map of orderId -> { courier, tracking }
  const [dispatchData, setDispatchData] = useState<Record<string, { courier: string; tracking: string }>>({});

  const socketRef = useRef<Socket | null>(null);

  // Sound generator using Web Audio API
  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      gain1.gain.setValueAtTime(0.25, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.4);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.15);
      osc2.stop(ctx.currentTime + 0.6);
    } catch (e) {
      console.warn('Audio chime playback omitted:', e);
    }
  };

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/orders`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Establish WebSocket connection
    const socket = io(getApiBaseUrl(), {
      transports: ['websocket', 'polling']
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('⚡ Operations Portal connected to WebSocket server');
      socket.emit('join:admin');
    });

    socket.on('order:new', (newOrder: any) => {
      console.log('🔔 Real-Time Order Arrived via WebSocket:', newOrder);
      playChime();
      setToastNotification({
        orderNumber: newOrder.orderNumber,
        customerName: newOrder.customerName,
        finalPayable: newOrder.finalPayable
      });
      fetchOrders();

      // Clear toast after 5s
      setTimeout(() => {
        setToastNotification(null);
      }, 5000);
    });

    socket.on('order:status_change', (event: any) => {
      console.log('🔄 Order Status Changed via WebSocket:', event);
      fetchOrders();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  if (!isOpen) return null;

  // Filter queues
  const adminQueue = orders.filter(o => o.status === 'ORDER_PLACED');
  const godownQueue = orders.filter(o => o.status === 'APPROVED_TO_GODOWN');
  const dispatchQueue = orders.filter(o => o.status === 'PACKED_READY_FOR_DISPATCH');
  const inTransitOrDelivered = orders.filter(
    o => o.status === 'DISPATCHED' || o.status === 'DELIVERED'
  );

  // Handlers
  const handleApprove = async (orderId: string) => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/orders/${orderId}/approve`, {
        method: 'POST',
        headers: authHeaders
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePack = async (orderId: string) => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/godown/pack/${orderId}`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ packedBy: `Admin (${user?.email || 'Operations Manager'})` })
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDispatch = async (orderId: string) => {
    const data = dispatchData[orderId] || {
      courier: 'Blue Dart Express',
      tracking: `BD${Date.now().toString().slice(-7)}`
    };

    try {
      const res = await fetch(`${getApiBaseUrl()}/api/dispatch/ship/${orderId}`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          courierPartner: data.courier,
          trackingNumber: data.tracking
        })
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeliver = async (orderId: string) => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/dispatch/deliver/${orderId}`, {
        method: 'POST',
        headers: authHeaders
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-6xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-900">
        {/* Real-Time Floating Audio Chime Toast - Navy + Blue Alert */}
        {toastNotification && (
          <div className="absolute top-16 right-6 z-50 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white p-4 rounded-xl shadow-2xl border-2 border-white flex items-center gap-3 animate-bounce-short">
            <div className="w-10 h-10 rounded-full bg-white text-blue-700 flex items-center justify-center font-bold shadow-md">
              <Bell className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-blue-100">
                🔔 WebSocket New Order Alert!
              </p>
              <p className="text-sm font-black">
                {toastNotification.orderNumber} • ₹{toastNotification.finalPayable}
              </p>
              <p className="text-[11px] font-medium text-blue-100">
                Customer: {toastNotification.customerName}
              </p>
            </div>
          </div>
        )}

        {/* Header - Deep Navy */}
        <div className="p-4 bg-slate-900 text-white border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-600/30">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-white">
                  Operations & Fulfillment Control Center
                </h2>
                <span className="flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  WebSocket Live
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Role Pipeline: <strong className="text-blue-300">Admin</strong> ➔ <strong className="text-sky-300">Godown</strong> ➔ <strong className="text-indigo-300">Dispatch</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={playChime}
              title="Test WebSocket Chime Sound"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-300 transition-colors text-xs flex items-center gap-1.5 border border-slate-700"
            >
              <Volume2 className="w-4 h-4" />
              <span className="hidden sm:inline">Test Chime</span>
            </button>
            <button
              onClick={fetchOrders}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Refresh Queue"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* KPI Counter Row - Clean Slate-50 Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-100 border-b border-slate-200 text-xs">
          <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
            <span className="text-slate-500 block font-semibold">Pending Admin Review</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {adminQueue.length}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
            <span className="text-slate-500 block font-semibold">Godown Packing Queue</span>
            <span className="text-2xl font-black text-blue-600 mt-1 block">
              {godownQueue.length}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
            <span className="text-slate-500 block font-semibold">Ready in Dispatch Bay</span>
            <span className="text-2xl font-black text-indigo-600 mt-1 block">
              {dispatchQueue.length}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
            <span className="text-slate-500 block font-semibold">In Transit / Delivered</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">
              {inTransitOrDelivered.length}
            </span>
          </div>
        </div>

        {/* Role Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 gap-2">
          <button
            onClick={() => setActiveTab('ADMIN')}
            className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'ADMIN'
                ? 'border-blue-600 text-blue-600 bg-white font-black shadow-sm'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>1. Admin Review</span>
            {adminQueue.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[10px] font-black">
                {adminQueue.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('GODOWN')}
            className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'GODOWN'
                ? 'border-blue-600 text-blue-600 bg-white font-black shadow-sm'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>2. Godown (Warehouse)</span>
            {godownQueue.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[10px] font-black">
                {godownQueue.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('DISPATCH')}
            className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'DISPATCH'
                ? 'border-blue-600 text-blue-600 bg-white font-black shadow-sm'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>3. Dispatch & Shipping</span>
            {dispatchQueue.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-600 text-white text-[10px] font-black">
                {dispatchQueue.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
          {/* TAB 1: ADMIN REVIEW */}
          {activeTab === 'ADMIN' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Incoming Order Approvals</h3>
                  <p className="text-xs text-slate-500">
                    Verify customer details & payments, then approve to the Godown warehouse.
                  </p>
                </div>
              </div>

              {adminQueue.length === 0 ? (
                <div className="p-12 text-center border border-dashed border-slate-300 rounded-2xl space-y-2 bg-white">
                  <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
                  <p className="font-bold text-sm text-slate-900">No Pending Orders</p>
                  <p className="text-xs text-slate-500">
                    All orders have been reviewed. Place a new order on the customer website to test the live WebSocket alert!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {adminQueue.map(order => (
                    <div
                      key={order.id}
                      className="p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-400 shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-black text-sm text-blue-700">
                            {order.orderNumber}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                            {order.paymentMode} ({order.paymentStatus})
                          </span>
                          <span className="text-xs text-slate-400">
                            Placed {new Date(order.createdAt).toLocaleTimeString()}
                          </span>
                        </div>

                        <div className="text-xs text-slate-700">
                          <strong>{order.customerName}</strong> ({order.customerPhone}) • {order.shippingAddress.city}, {order.shippingAddress.state}
                        </div>

                        {/* Items list */}
                        <div className="flex flex-wrap gap-2 pt-1">
                          {order.items.map((it: any, idx: number) => (
                            <span
                              key={idx}
                              className="text-[11px] bg-slate-50 px-2 py-1 rounded border border-slate-200 text-slate-700 font-medium"
                            >
                              {it.quantity}x {it.productName} ({it.color})
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className="text-xl font-black text-blue-600 block">
                            ₹{order.finalPayable}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Total MRP: ₹{order.subtotalMrp}
                          </span>
                        </div>

                        <button
                          onClick={() => handleApprove(order.id)}
                          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-all active:scale-95"
                        >
                          <span>Approve & Send to Godown</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: GODOWN WAREHOUSE */}
          {activeTab === 'GODOWN' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Warehouse Packing & Stock Allocation</h3>
                  <p className="text-xs text-slate-500">
                    Pack order items and hand over to Dispatch bay.
                  </p>
                </div>
              </div>

              {godownQueue.length === 0 ? (
                <div className="p-12 text-center border border-dashed border-slate-300 rounded-2xl space-y-2 bg-white">
                  <Building2 className="w-10 h-10 text-blue-500 mx-auto" />
                  <p className="font-bold text-sm text-slate-900">Godown Packing Bay is Empty</p>
                  <p className="text-xs text-slate-500">
                    No orders waiting for packing. Approve orders from the Admin tab to send them here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {godownQueue.map(order => (
                    <div
                      key={order.id}
                      className="p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-400 shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm text-blue-700">
                            {order.orderNumber}
                          </span>
                          <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded border border-blue-200">
                            APPROVED BY ADMIN
                          </span>
                          <span className="text-xs text-slate-500">
                            Customer: {order.customerName}
                          </span>
                        </div>

                        {/* Pick List */}
                        <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200 space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                            Order Items Pick List:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {order.items.map((it: any, idx: number) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded text-xs border border-slate-200"
                              >
                                <div>
                                  <span className="font-bold text-slate-900">
                                    {it.quantity}x {it.productName}
                                  </span>
                                  <span className="text-[11px] text-slate-500 block">
                                    Color: <strong className="text-blue-600">{it.color}</strong>
                                    {it.capacity && ` • ${it.capacity}`}
                                  </span>
                                </div>
                                <span className="font-mono font-bold text-xs text-emerald-700">
                                  ₹{it.price * it.quantity}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                        <button
                          onClick={() => setPrintOrder(order)}
                          className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-300 flex items-center gap-1.5 transition-all shadow-sm"
                          title="Print Warehouse Pick Slip"
                        >
                          <Printer className="w-3.5 h-3.5 text-slate-700" />
                          <span>Print Slip</span>
                        </button>

                        <button
                          onClick={() => handlePack(order.id)}
                          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-all active:scale-95"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Pack Order & Move to Dispatch</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DISPATCH & LOGISTICS */}
          {activeTab === 'DISPATCH' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Dispatch Logistics Bay</h3>
                  <p className="text-xs text-slate-500">
                    Assign courier partner, attach tracking AWB, and dispatch package.
                  </p>
                </div>
              </div>

              {dispatchQueue.length === 0 ? (
                <div className="p-12 text-center border border-dashed border-slate-300 rounded-2xl space-y-2 bg-white">
                  <Truck className="w-10 h-10 text-blue-500 mx-auto" />
                  <p className="font-bold text-sm text-slate-900">No Orders Awaiting Dispatch</p>
                  <p className="text-xs text-slate-500">
                    Pack orders from the Godown tab to prepare them for shipping.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dispatchQueue.map(order => {
                    const currentCourier = dispatchData[order.id]?.courier || 'Blue Dart Express';
                    const currentTracking = dispatchData[order.id]?.tracking || `TRK${order.orderNumber.replace(/[^0-9]/g, '')}`;

                    return (
                      <div
                        key={order.id}
                        className="p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-400 shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-sm text-blue-700">
                              {order.orderNumber}
                            </span>
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-200">
                              PACKED & INSPECTED
                            </span>
                            <span className="text-xs text-slate-500">
                              Packed by {order.godownDetails?.packedBy || 'Godown Manager'}
                            </span>
                          </div>

                          <p className="text-xs text-slate-700">
                            Destination: <strong>{order.shippingAddress.street}, {order.shippingAddress.city} - {order.shippingAddress.pincode}</strong>
                          </p>

                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            {/* Courier Selection */}
                            <select
                              value={currentCourier}
                              onChange={e =>
                                setDispatchData(prev => ({
                                  ...prev,
                                  [order.id]: {
                                    courier: e.target.value,
                                    tracking: currentTracking
                                  }
                                }))
                              }
                              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                            >
                              <option value="Blue Dart Express">Blue Dart Express</option>
                              <option value="DTDC Courier">DTDC Express</option>
                              <option value="Delhivery Surface">Delhivery Surface</option>
                              <option value="Local Homely Express">Local Homely Logistics</option>
                            </select>

                            {/* Tracking Number */}
                            <input
                              type="text"
                              value={currentTracking}
                              onChange={e =>
                                setDispatchData(prev => ({
                                  ...prev,
                                  [order.id]: {
                                    courier: currentCourier,
                                    tracking: e.target.value
                                  }
                                }))
                              }
                              placeholder="Tracking / AWB #"
                              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-600"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <button
                            onClick={() => {
                              const cleanPhone = (order.customerPhone || '').replace(/[^0-9]/g, '');
                              const msg = encodeURIComponent(
                                `Hello ${order.customerName}! Your Homely Order (${order.orderNumber}) has been dispatched via ${currentCourier}. Tracking AWB: ${currentTracking}. Track live here: http://localhost:3000`
                              );
                              window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
                            }}
                            className="px-3 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-300 flex items-center gap-1.5 transition-all"
                            title="Send WhatsApp Delivery Update"
                          >
                            <span>WhatsApp</span>
                          </button>

                          <button
                            onClick={() => setPrintOrder(order)}
                            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all border border-slate-300"
                            title="Print Dispatch Waybill"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDispatch(order.id)}
                            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-all active:scale-95"
                          >
                            <Truck className="w-4 h-4" />
                            <span>Dispatch Order</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Already Dispatched Table */}
              {inTransitOrDelivered.length > 0 && (
                <div className="pt-6 border-t border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Dispatched & In-Transit Parcels ({inTransitOrDelivered.length})
                  </h4>
                  <div className="space-y-2">
                    {inTransitOrDelivered.map(order => (
                      <div
                        key={order.id}
                        className="p-3 rounded-lg bg-white border border-slate-200 flex items-center justify-between text-xs shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-slate-900">
                            {order.orderNumber}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              order.status === 'DELIVERED'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {order.status}
                          </span>
                          <span className="text-slate-500">
                            {order.dispatchDetails?.courierPartner} (AWB: {order.dispatchDetails?.trackingNumber})
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setPrintOrder(order)}
                            className="p-1.5 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                            title="Print Invoice"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          {order.status !== 'DELIVERED' && (
                            <button
                              onClick={() => handleDeliver(order.id)}
                              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-bold text-[10px] border border-slate-300"
                            >
                              Mark Delivered
                            </button>
                          )}
                          <button
                            onClick={() => {
                              onClose();
                              onTrackOrder(order.id);
                            }}
                            className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 text-[10px] font-bold border border-blue-200"
                          >
                            Track Live
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Printable Slip & Invoice Modal */}
      <PrintSlipModal
        isOpen={!!printOrder}
        onClose={() => setPrintOrder(null)}
        order={printOrder}
      />
    </div>
  );
};
