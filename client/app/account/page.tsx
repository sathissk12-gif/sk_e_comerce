'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { OrderTrackerModal } from '../../components/OrderTrackerModal';
import { PrintSlipModal } from '../../components/PrintSlipModal';
import {
  User,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  Printer,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Store,
  RefreshCw,
  ArrowRight,
  LogIn,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { io } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';

export default function AccountPage() {
  const { user, logout, openAuthModal } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [printOrder, setPrintOrder] = useState<any | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:4000/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const socket = io('http://localhost:4000');
    socket.on('order:status_change', () => {
      fetchOrders();
    });
    socket.on('order:new', () => {
      fetchOrders();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ORDER_PLACED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-warm-beige text-charcoal border border-sage/40 flex items-center gap-1">
            <Clock className="w-3 h-3 text-deep-green" />
            <span>Order Placed</span>
          </span>
        );
      case 'APPROVED_TO_GODOWN':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-sage-light text-deep-green border border-sage/60 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-deep-green" />
            <span>Approved for Packing</span>
          </span>
        );
      case 'PACKED_READY_FOR_DISPATCH':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-warm-beige text-deep-green border border-muted-gold/50 flex items-center gap-1">
            <Package className="w-3 h-3 text-muted-gold" />
            <span>Packed in Godown</span>
          </span>
        );
      case 'DISPATCHED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-deep-green text-muted-gold border border-muted-gold/40 flex items-center gap-1">
            <Truck className="w-3 h-3 text-muted-gold" />
            <span>In Transit</span>
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-sage-light text-deep-green border border-sage flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-deep-green" />
            <span>Delivered</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-warm-beige text-charcoal border border-warm-beige-dark">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream text-charcoal">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Page Title */}
        <div className="pb-6 border-b border-warm-beige flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-deep-green text-xs font-black uppercase tracking-wider mb-1">
              <User className="w-3.5 h-3.5 text-muted-gold" />
              <span>Customer Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-charcoal tracking-tight">
              My Account & Order History
            </h1>
          </div>

          <button
            onClick={fetchOrders}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-card border border-warm-beige text-xs font-bold text-charcoal hover:bg-warm-beige shadow-sm transition-all self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Orders</span>
          </button>
        </div>

        {/* Dashboard Grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Profile Card & Address */}
          <div className="space-y-6">
            {/* User Info Box or Sign In Prompt */}
            {user ? (
              <div className="bg-card rounded-2xl p-6 border border-warm-beige shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-warm-beige">
                  <div className="flex items-center gap-4">
                    {user.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-sage/60 shadow-md"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-deep-green text-muted-gold flex items-center justify-center font-black text-xl shadow-md shadow-deep-green/20 border border-muted-gold/40">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-lg text-charcoal">{user.name}</h3>
                      <span className="text-xs text-deep-green font-bold bg-warm-beige px-2 py-0.5 rounded border border-sage/40">
                        {user.role === 'ADMIN' ? 'Homely Admin' : 'Verified Customer'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    title="Sign Out"
                    className="p-2 rounded-xl text-secondary-text hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 text-xs text-secondary-text">
                  {user.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-deep-green" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-deep-green" />
                    <span>{user.email}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-2xl p-6 border border-warm-beige shadow-sm space-y-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-warm-beige text-deep-green mx-auto flex items-center justify-center font-black">
                  <User className="w-6 h-6 text-deep-green" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-charcoal">Sign In to Your Account</h3>
                  <p className="text-xs text-secondary-text mt-1">
                    Sign in with Google or Email to track personal orders and manage addresses.
                  </p>
                </div>
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => openAuthModal('login')}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-deep-green hover:bg-deep-green-hover text-cream text-xs font-bold shadow-md shadow-deep-green/20 transition-all"
                  >
                    <LogIn className="w-3.5 h-3.5 text-muted-gold" />
                    <span>Sign In or Register</span>
                  </button>
                </div>
              </div>
            )}

            {/* Saved Delivery Address */}
            <div className="bg-card rounded-2xl p-6 border border-warm-beige shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs uppercase tracking-wider text-secondary-text flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-deep-green" />
                  <span>Default Shipping Address</span>
                </h4>
                <span className="text-[10px] bg-warm-beige text-deep-green px-2 py-0.5 rounded font-black">
                  PRIMARY
                </span>
              </div>

              <div className="text-xs text-charcoal space-y-1">
                <p className="font-bold text-charcoal">Sathish Kumar</p>
                <p className="text-secondary-text">12, Gandhi Salai, T. Nagar</p>
                <p className="text-secondary-text">
                  Chennai, Tamil Nadu - <strong>600017</strong>
                </p>
                <p className="text-secondary-text font-mono pt-1">Phone: +91 98410 12345</p>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-deep-green rounded-2xl p-6 text-cream border border-deep-green-light space-y-3 shadow-lg">
              <h4 className="font-bold text-sm text-cream">Looking for more festive sets?</h4>
              <p className="text-xs text-sage leading-relaxed">
                Explore the latest casseroles, vacuum flasks, and storage combos with 32% discount.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-muted-gold hover:bg-muted-gold-dark text-deep-green font-black text-xs transition-all shadow-md shadow-muted-gold/20"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Browse Store</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Orders History List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-charcoal">
                Past Orders ({orders.length})
              </h2>
              <span className="text-xs text-secondary-text">Live milestone updates active</span>
            </div>

            {orders.length === 0 ? (
              <div className="p-12 text-center bg-card border border-dashed border-warm-beige rounded-2xl space-y-3">
                <Package className="w-12 h-12 text-secondary-text/60 mx-auto" />
                <h3 className="font-bold text-base text-charcoal">No Orders Placed Yet</h3>
                <p className="text-xs text-secondary-text max-w-sm mx-auto leading-relaxed">
                  You haven't placed any orders yet. Visit the shop catalog to select casseroles and festive bundles!
                </p>
                <Link
                  href="/shop"
                  className="inline-block px-5 py-2.5 rounded-xl bg-deep-green text-cream font-bold text-xs shadow-md shadow-deep-green/20 active:scale-95"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div
                    key={order.id}
                    className="bg-card rounded-2xl border border-warm-beige shadow-sm hover:border-muted-gold transition-all overflow-hidden"
                  >
                    {/* Order Header */}
                    <div className="p-4 bg-cream/70 border-b border-warm-beige flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <div>
                          <span className="font-mono font-black text-sm text-deep-green block">
                            {order.orderNumber}
                          </span>
                          <span className="text-[11px] text-secondary-text">
                            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {getStatusBadge(order.status)}
                        <span className="text-sm font-black text-charcoal ml-2">
                          ₹{order.finalPayable}
                        </span>
                      </div>
                    </div>

                    {/* Order Items List */}
                    <div className="p-4 space-y-3">
                      {order.items.map((item: any, i: number) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-cream border border-warm-beige p-1 flex items-center justify-center shrink-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={item.imageUrl || '/products/master_casserole.png'}
                                alt={item.productName}
                                className="max-h-full max-w-full object-contain"
                              />
                            </div>
                            <div>
                              <p className="font-bold text-charcoal">{item.productName}</p>
                              <p className="text-[11px] text-secondary-text">
                                Qty: {item.quantity} • Color: <span className="text-deep-green font-bold">{item.color}</span>
                                {item.capacity && ` • ${item.capacity}`}
                              </p>
                            </div>
                          </div>
                          <span className="font-bold text-charcoal">
                            ₹{item.totalPrice}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Order Tracking Information if available */}
                    {order.dispatchDetails?.trackingNumber && (
                      <div className="px-4 py-2.5 bg-warm-beige/50 border-t border-warm-beige flex items-center justify-between text-xs text-charcoal">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-deep-green" />
                          <span>
                            Shipped via <strong>{order.dispatchDetails.courierPartner}</strong> (AWB: <strong className="font-mono text-deep-green">{order.dispatchDetails.trackingNumber}</strong>)
                          </span>
                        </div>
                        <span className="text-[11px] text-secondary-text font-medium">
                          Expected: {order.dispatchDetails.expectedDelivery}
                        </span>
                      </div>
                    )}

                    {/* Actions Bar */}
                    <div className="p-3 bg-cream border-t border-warm-beige flex items-center justify-between gap-3 text-xs">
                      <div className="text-secondary-text text-[11px]">
                        Payment: <strong>{order.paymentMode}</strong> ({order.paymentStatus})
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPrintOrder(order)}
                          className="px-3 py-1.5 rounded-lg bg-card hover:bg-warm-beige text-charcoal font-bold border border-warm-beige flex items-center gap-1.5 shadow-sm transition-all"
                        >
                          <Printer className="w-3.5 h-3.5 text-secondary-text" />
                          <span>Invoice</span>
                        </button>

                        <button
                          onClick={() => {
                            setTrackingOrderId(order.id);
                            setIsTrackerOpen(true);
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-deep-green hover:bg-deep-green-hover text-cream font-bold flex items-center gap-1.5 shadow-sm shadow-deep-green/20 transition-all border border-deep-green-light"
                        >
                          <span>Track Live</span>
                          <ChevronRight className="w-3.5 h-3.5 text-muted-gold" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Live Order Tracker Modal */}
      <OrderTrackerModal
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
        orderId={trackingOrderId}
      />

      {/* Printable Invoice Modal */}
      <PrintSlipModal
        isOpen={!!printOrder}
        onClose={() => setPrintOrder(null)}
        order={printOrder}
      />
    </div>
  );
}
