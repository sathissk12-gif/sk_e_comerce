'use client';

import React, { useEffect, useState } from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  Package,
  Truck,
  Home,
  ShieldCheck,
  ExternalLink,
  MapPin
} from 'lucide-react';
import { io } from 'socket.io-client';

interface OrderTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string | null;
}

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({
  isOpen,
  onClose,
  orderId
}) => {
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchOrder = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:4000/api/orders/${id}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data.order);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId && isOpen) {
      fetchOrder(orderId);

      const socket = io('http://localhost:4000');
      socket.on('connect', () => {
        socket.emit('join:order', orderId);
      });

      socket.on('order:status_change', (event: any) => {
        if (event.orderId === orderId || event.orderNumber === orderId) {
          setOrder(event.order);
        }
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [orderId, isOpen]);

  if (!isOpen) return null;

  const getStepStatus = (step: number) => {
    if (!order) return 'upcoming';
    const statusMap: Record<string, number> = {
      ORDER_PLACED: 1,
      APPROVED_TO_GODOWN: 2,
      PACKED_READY_FOR_DISPATCH: 3,
      DISPATCHED: 4,
      DELIVERED: 5
    };

    const currentStep = statusMap[order.status] || 1;
    if (step < currentStep) return 'completed';
    if (step === currentStep) return 'current';
    return 'upcoming';
  };

  const steps = [
    { step: 1, label: 'Order Placed', desc: 'Customer placed order with payment verification', icon: Clock },
    { step: 2, label: 'Admin Approved', desc: 'Approved and routed to Godown warehouse', icon: ShieldCheck },
    { step: 3, label: 'Packed in Godown', desc: 'Picked from inventory racks & quality packed', icon: Package },
    { step: 4, label: 'Dispatched & Shipping', desc: 'Courier AWB attached & handed to delivery partner', icon: Truck },
    { step: 5, label: 'Delivered', desc: 'Arrived safely at customer doorstep', icon: Home },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-charcoal/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-card border border-warm-beige rounded-2xl shadow-2xl overflow-hidden text-charcoal">
        {/* Header - Deep Green */}
        <div className="p-4 bg-deep-green text-cream border-b border-deep-green-light flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black tracking-tight">Live Order Milestone Tracker</h3>
              <span className="w-2 h-2 rounded-full bg-muted-gold animate-pulse" />
            </div>
            {order && (
              <p className="text-xs text-sage font-mono font-bold">
                {order.orderNumber} • Placed {new Date(order.createdAt).toLocaleDateString()}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-sage hover:text-cream hover:bg-deep-green-light transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto bg-card">
          {loading && !order ? (
            <div className="p-12 text-center text-secondary-text">
              <div className="w-8 h-8 border-2 border-deep-green border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading order details...
            </div>
          ) : !order ? (
            <div className="p-12 text-center text-secondary-text">Order not found.</div>
          ) : (
            <>
              {/* Stepper */}
              <div className="space-y-4">
                {steps.map((s, idx) => {
                  const state = getStepStatus(s.step);
                  const Icon = s.icon;
                  return (
                    <div key={s.step} className="flex gap-4 relative">
                      {/* Vertical line */}
                      {idx !== steps.length - 1 && (
                        <div
                          className={`absolute left-4 top-8 bottom-0 w-0.5 ${
                            state === 'completed' ? 'bg-deep-green' : 'bg-warm-beige'
                          }`}
                        />
                      )}

                      {/* Icon Bubble */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-all ${
                          state === 'completed'
                            ? 'bg-deep-green text-cream shadow-md shadow-deep-green/30'
                            : state === 'current'
                            ? 'bg-warm-beige text-deep-green border-2 border-deep-green animate-pulse'
                            : 'bg-cream text-secondary-text border border-warm-beige'
                        }`}
                      >
                        {state === 'completed' ? (
                          <CheckCircle2 className="w-4 h-4 text-muted-gold" />
                        ) : (
                          <Icon className="w-4 h-4" />
                        )}
                      </div>

                      {/* Step Details */}
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between">
                          <h4
                            className={`font-bold text-sm ${
                              state === 'completed'
                                ? 'text-charcoal'
                                : state === 'current'
                                ? 'text-deep-green'
                                : 'text-secondary-text'
                            }`}
                          >
                            {s.label}
                          </h4>
                          {state === 'current' && (
                            <span className="text-[10px] bg-warm-beige text-deep-green px-2 py-0.5 rounded font-bold uppercase tracking-wider border border-sage/40">
                              In Progress
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-secondary-text mt-0.5">{s.desc}</p>

                        {/* Dispatched Details */}
                        {s.step === 4 && order.dispatchDetails && (
                          <div className="mt-2 p-2.5 rounded-lg bg-warm-beige/60 border border-sage/40 text-xs text-charcoal space-y-1">
                            <div className="flex justify-between">
                              <span>Courier: <strong>{order.dispatchDetails.courierPartner}</strong></span>
                              <span>AWB: <strong className="font-mono text-deep-green">{order.dispatchDetails.trackingNumber}</strong></span>
                            </div>
                            <div className="text-secondary-text">
                              Expected Delivery: <span className="text-charcoal font-bold">{order.dispatchDetails.expectedDelivery}</span>
                            </div>
                          </div>
                        )}

                        {/* Packed Details */}
                        {s.step === 3 && order.godownDetails && (
                          <div className="mt-2 p-2 rounded-lg bg-cream border border-warm-beige text-[11px] text-secondary-text">
                            Packed by {order.godownDetails.packedBy} • Stock verified
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Summary & Destination */}
              <div className="pt-4 border-t border-warm-beige grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-cream border border-warm-beige space-y-1.5">
                  <span className="text-secondary-text font-bold uppercase text-[10px] block">
                    Delivery Address
                  </span>
                  <p className="text-charcoal font-bold">{order.customerName}</p>
                  <p className="text-secondary-text">{order.shippingAddress.street}</p>
                  <p className="text-secondary-text">
                    {order.shippingAddress.city}, {order.shippingAddress.state} - <strong>{order.shippingAddress.pincode}</strong>
                  </p>
                  <p className="text-secondary-text font-mono">{order.customerPhone}</p>
                </div>

                <div className="p-3 rounded-xl bg-cream border border-warm-beige space-y-1.5">
                  <span className="text-secondary-text font-bold uppercase text-[10px] block">
                    Payment & Items
                  </span>
                  <div className="flex justify-between">
                    <span className="text-secondary-text">Payment:</span>
                    <span className="text-charcoal font-bold">{order.paymentMode} ({order.paymentStatus})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-text">Total Paid:</span>
                    <span className="text-deep-green font-black text-sm">₹{order.finalPayable}</span>
                  </div>
                  <div className="pt-1 text-secondary-text text-[11px]">
                    {order.items.length} item(s) ordered from Homely
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
