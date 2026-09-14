'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { PrintSlipModal } from '../../components/PrintSlipModal';
import { getApiBaseUrl } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { isAuthorizedAdmin, AUTHORIZED_ADMIN_EMAILS } from '../../lib/auth-constants';
import {
  Building2,
  Truck,
  CheckCircle2,
  Package,
  Plus,
  Trash2,
  Edit,
  RefreshCw,
  Bell,
  Volume2,
  Search,
  Check,
  X,
  Printer,
  ChevronRight,
  Tag,
  Lock,
  ShieldAlert,
  ShieldCheck,
  LogIn,
  LogOut
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';

export default function AdminPage() {
  const { user, token, isLoading: authLoading, openAuthModal, logout } = useAuth();
  const isAdmin = user ? isAuthorizedAdmin(user.email) : false;

  const authHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const [activeTab, setActiveTab] = useState<'PRODUCTS' | 'ORDERS' | 'COUPONS' | 'GODOWN'>('ORDERS');
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [orderFilter, setOrderFilter] = useState<'ALL' | 'ORDER_PLACED' | 'APPROVED_TO_GODOWN' | 'PACKED_READY_FOR_DISPATCH' | 'DISPATCHED' | 'DELIVERED'>('ALL');
  const [productSearch, setProductSearch] = useState('');

  // Dispatch fields state
  const [dispatchData, setDispatchData] = useState<Record<string, { courier: string; tracking: string }>>({});
  const [printOrder, setPrintOrder] = useState<any | null>(null);

  // New Product Modal
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'casseroles',
    brand: 'Homely',
    badge: 'GRAND FESTIVE OFFER',
    description: '',
    imageUrl: '/products/master_casserole.png',
    mrp: 1800,
    offerPrice: 1250,
    stockQty: 30,
    colors: 'Sapphire Blue, Pearl White, Rose Gold',
    capacity: '1500ml + 3500ml'
  });

  // New Coupon Modal
  const [isAddCouponOpen, setIsAddCouponOpen] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    value: 10,
    minOrder: 1000
  });

  // Real-Time Notification
  const [toastNotification, setToastNotification] = useState<{
    orderNumber: string;
    customerName: string;
    finalPayable: number;
  } | null>(null);

  const socketRef = useRef<Socket | null>(null);

  // Sound generator
  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
      gain1.gain.setValueAtTime(0.25, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.4);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
      gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.15);
      osc2.stop(ctx.currentTime + 0.6);
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [ordersRes, prodsRes, coupRes] = await Promise.all([
        fetch(`${getApiBaseUrl()}/api/orders`),
        fetch(`${getApiBaseUrl()}/api/products`),
        fetch(`${getApiBaseUrl()}/api/coupons`)
      ]);

      if (ordersRes.ok) {
        const d = await ordersRes.json();
        setOrders(d.orders || []);
      }
      if (prodsRes.ok) {
        const d = await prodsRes.json();
        setProducts(d.products || []);
      }
      if (coupRes.ok) {
        const d = await coupRes.json();
        setCoupons(d.coupons || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const socket = io(getApiBaseUrl(), {
      transports: ['websocket', 'polling']
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join:admin');
    });

    socket.on('order:new', (newOrder: any) => {
      playChime();
      setToastNotification({
        orderNumber: newOrder.orderNumber,
        customerName: newOrder.customerName,
        finalPayable: newOrder.finalPayable
      });
      fetchData();
      setTimeout(() => setToastNotification(null), 5000);
    });

    socket.on('order:status_change', () => {
      fetchData();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Order Pipeline Actions
  const handleApprove = async (orderId: string) => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/orders/${orderId}/approve`, {
        method: 'POST',
        headers: authHeaders
      });
      if (res.ok) fetchData();
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
      if (res.ok) fetchData();
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
      if (res.ok) fetchData();
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
      if (res.ok) fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  // Product Actions
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingProduct
        ? `${getApiBaseUrl()}/api/products/${editingProduct.id}`
        : `${getApiBaseUrl()}/api/products`;
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: authHeaders,
        body: JSON.stringify(productForm)
      });

      if (res.ok) {
        setIsAddProductOpen(false);
        setEditingProduct(null);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/products/${id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      if (res.ok) fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdjustStock = async (id: string, delta: number) => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/products/${id}/stock`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ delta })
      });
      if (res.ok) fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  // Coupon Actions
  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/coupons`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(couponForm)
      });

      if (res.ok) {
        setIsAddCouponOpen(false);
        setCouponForm({ code: '', description: '', discountType: 'percentage', value: 10, minOrder: 1000 });
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteCoupon = async (code: string) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/coupons/${code}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      if (res.ok) fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  // KPIs
  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'PAID')
    .reduce((sum, o) => sum + (o.finalPayable || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'ORDER_PLACED').length;
  const godownOrders = orders.filter(o => o.status === 'APPROVED_TO_GODOWN').length;
  const dispatchOrders = orders.filter(o => o.status === 'PACKED_READY_FOR_DISPATCH').length;
  const lowStockProducts = products.filter(p => (p.variants[0]?.stockQty || 0) < 15).length;

  const filteredOrders = orderFilter === 'ALL'
    ? orders
    : orders.filter(o => o.status === orderFilter);

  const filteredProducts = productSearch.trim()
    ? products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.category.toLowerCase().includes(productSearch.toLowerCase()))
    : products;

  // --- ACCESS CONTROL SECURITY GATES ---
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-cream text-charcoal">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <RefreshCw className="w-10 h-10 animate-spin text-muted-gold mx-auto mb-4" />
            <p className="text-base font-black text-charcoal">Verifying Administrator Access...</p>
            <p className="text-xs text-secondary-text mt-1">Checking secure session privileges</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Not logged in -> High Security Lock Gate
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-cream text-charcoal">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-md bg-card border-2 border-warm-beige rounded-3xl shadow-2xl p-8 text-center animate-scale-up">
            <div className="w-16 h-16 bg-deep-green/10 text-deep-green rounded-2xl flex items-center justify-center mx-auto mb-5 border border-deep-green/20 shadow-sm">
              <Lock className="w-8 h-8 text-deep-green" />
            </div>
            <div className="inline-block px-3 py-1 rounded-full bg-deep-green text-cream text-[11px] font-black uppercase tracking-wider mb-3">
              Protected Production Gate
            </div>
            <h1 className="text-2xl font-black text-charcoal mb-2">Administrator Access Required</h1>
            <p className="text-sm text-secondary-text mb-6">
              The Homely Operations & Admin Portal is restricted to designated administrator accounts.
            </p>

            <div className="p-4 bg-warm-beige/50 rounded-2xl border border-warm-beige mb-6 text-left">
              <p className="text-[11px] font-bold text-deep-green uppercase tracking-wider mb-2">
                Authorized Administrator Accounts:
              </p>
              <ul className="text-xs font-semibold text-charcoal space-y-1.5">
                {AUTHORIZED_ADMIN_EMAILS.map(em => (
                  <li key={em} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-muted-gold shrink-0" />
                    <span className="font-mono">{em}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => openAuthModal('login')}
              className="w-full py-3.5 px-6 rounded-2xl bg-deep-green hover:bg-deep-green-hover text-cream font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <LogIn className="w-4 h-4 text-muted-gold" />
              <span>Sign In as Administrator</span>
            </button>

            <div className="mt-4">
              <Link href="/" className="text-xs font-bold text-secondary-text hover:text-deep-green transition-colors">
                ← Return to Storefront
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Logged in as non-authorized user -> 403 Forbidden Gate
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-cream text-charcoal">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-md bg-card border-2 border-red-200 rounded-3xl shadow-2xl p-8 text-center animate-scale-up">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-red-200 shadow-sm">
              <ShieldAlert className="w-8 h-8 text-red-600" />
            </div>
            <div className="inline-block px-3 py-1 rounded-full bg-red-100 text-red-800 text-[11px] font-black uppercase tracking-wider mb-3">
              403 Forbidden • Access Denied
            </div>
            <h1 className="text-2xl font-black text-charcoal mb-2">Restricted Access</h1>
            <p className="text-sm text-secondary-text mb-4">
              You are signed in as <strong className="text-charcoal font-mono">{user.email}</strong>. This account is not authorized to access administrative controls.
            </p>

            <div className="p-4 bg-red-50/60 rounded-2xl border border-red-200 mb-6 text-left">
              <p className="text-[11px] font-bold text-red-800 uppercase tracking-wider mb-2">
                Only the following authorized emails can open Admin:
              </p>
              <ul className="text-xs font-semibold text-charcoal space-y-1.5">
                {AUTHORIZED_ADMIN_EMAILS.map(em => (
                  <li key={em} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                    <span className="font-mono">{em}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={() => {
                  logout();
                  openAuthModal('login');
                }}
                className="w-full py-3.5 px-6 rounded-2xl bg-deep-green hover:bg-deep-green-hover text-cream font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <LogIn className="w-4 h-4 text-muted-gold" />
                <span>Switch to Authorized Admin Account</span>
              </button>

              <Link
                href="/"
                className="block w-full py-2.5 text-xs font-bold text-secondary-text hover:text-charcoal transition-colors text-center"
              >
                ← Return to Storefront
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // --- AUTHORIZED ADMIN DASHBOARD ---
  return (
    <div className="min-h-screen flex flex-col bg-cream text-charcoal">
      <Navbar />

      {/* Real-time Order Notification Toast */}
      {toastNotification && (
        <div className="fixed top-20 right-6 z-50 bg-deep-green text-cream p-4 rounded-2xl shadow-2xl border-2 border-muted-gold flex items-center gap-3 animate-bounce-short">
          <div className="w-10 h-10 rounded-xl bg-muted-gold text-deep-green flex items-center justify-center font-bold">
            <Bell className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-muted-gold">
              🔔 WebSocket New Order Alert!
            </p>
            <p className="text-sm font-black">
              {toastNotification.orderNumber} • ₹{toastNotification.finalPayable}
            </p>
            <p className="text-xs text-sage">
              Customer: {toastNotification.customerName}
            </p>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Admin Header */}
        <div className="pb-6 border-b border-warm-beige flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black px-2 py-0.5 rounded bg-warm-beige text-deep-green border border-sage/40">
                ADMIN CONSOLE
              </span>
              <span className="flex items-center gap-1 text-[11px] text-deep-green font-bold bg-sage-light px-2 py-0.5 rounded-full border border-sage/60">
                <span className="w-1.5 h-1.5 rounded-full bg-deep-green animate-ping" />
                Live WebSocket Gateway
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-charcoal tracking-tight mt-1">
              Operations, Inventory & Order Portal
            </h1>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-deep-green text-cream border border-muted-gold/40 text-xs font-bold shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-muted-gold shrink-0" />
              <span className="hidden sm:inline font-mono">{user?.email}</span>
              <span className="text-[10px] bg-muted-gold text-deep-green px-1.5 py-0.5 rounded font-black uppercase">Verified Admin</span>
            </div>
            <button
              onClick={playChime}
              title="Test WebSocket Chime"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card hover:bg-warm-beige text-charcoal text-xs font-bold border border-warm-beige shadow-sm transition-all"
            >
              <Volume2 className="w-3.5 h-3.5 text-muted-gold" />
              <span>Chime</span>
            </button>
            <button
              onClick={fetchData}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card hover:bg-warm-beige text-charcoal text-xs font-bold border border-warm-beige shadow-sm transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* KPI Counter Row */}
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-4 rounded-2xl bg-card border border-warm-beige shadow-sm">
            <span className="text-xs font-bold text-secondary-text block">Total Revenue</span>
            <span className="text-2xl font-black text-deep-green mt-1 block">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-muted-gold-dark font-bold">Paid Orders</span>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-warm-beige shadow-sm">
            <span className="text-xs font-bold text-secondary-text block">Pending Approvals</span>
            <span className="text-2xl font-black text-muted-gold-dark mt-1 block">
              {pendingOrders}
            </span>
            <span className="text-[10px] text-muted-gold-dark font-bold">Requires Action</span>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-warm-beige shadow-sm">
            <span className="text-xs font-bold text-secondary-text block">Godown Packing</span>
            <span className="text-2xl font-black text-deep-green mt-1 block">
              {godownOrders}
            </span>
            <span className="text-[10px] text-deep-green font-bold">In Warehouse</span>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-warm-beige shadow-sm">
            <span className="text-xs font-bold text-secondary-text block">Ready in Dispatch</span>
            <span className="text-2xl font-black text-charcoal mt-1 block">
              {dispatchOrders}
            </span>
            <span className="text-[10px] text-secondary-text font-bold">Awaiting Courier</span>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-warm-beige shadow-sm">
            <span className="text-xs font-bold text-secondary-text block">Total Products</span>
            <span className="text-2xl font-black text-charcoal mt-1 block">
              {products.length}
            </span>
            <span className="text-[10px] text-rose-600 font-bold">{lowStockProducts} Low Stock</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 flex border-b border-warm-beige bg-card rounded-t-2xl px-4 pt-2 gap-2 shadow-sm">
          <button
            onClick={() => setActiveTab('ORDERS')}
            className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'ORDERS'
                ? 'border-deep-green text-deep-green font-black'
                : 'border-transparent text-secondary-text hover:text-charcoal'
            }`}
          >
            <Truck className="w-4 h-4 text-deep-green" />
            <span>Order Pipeline ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('PRODUCTS')}
            className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'PRODUCTS'
                ? 'border-deep-green text-deep-green font-black'
                : 'border-transparent text-secondary-text hover:text-charcoal'
            }`}
          >
            <Package className="w-4 h-4 text-deep-green" />
            <span>Product Management ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('COUPONS')}
            className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'COUPONS'
                ? 'border-deep-green text-deep-green font-black'
                : 'border-transparent text-secondary-text hover:text-charcoal'
            }`}
          >
            <Tag className="w-4 h-4 text-deep-green" />
            <span>Coupons Engine ({coupons.length})</span>
          </button>
        </div>

        {/* Tab 1: Orders Pipeline */}
        {activeTab === 'ORDERS' && (
          <div className="bg-card rounded-b-2xl p-6 border-x border-b border-warm-beige shadow-sm space-y-6">
            {/* Status Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-warm-beige text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'ALL', label: 'All Orders' },
                  { id: 'ORDER_PLACED', label: 'Pending Approval' },
                  { id: 'APPROVED_TO_GODOWN', label: 'In Godown' },
                  { id: 'PACKED_READY_FOR_DISPATCH', label: 'Ready to Ship' },
                  { id: 'DISPATCHED', label: 'In Transit' },
                  { id: 'DELIVERED', label: 'Delivered' }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setOrderFilter(f.id as any)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                      orderFilter === f.id
                        ? 'bg-deep-green text-cream shadow-sm shadow-deep-green/20'
                        : 'bg-warm-beige/50 text-secondary-text hover:bg-warm-beige hover:text-charcoal'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <span className="text-secondary-text font-medium">
                Showing {filteredOrders.length} orders
              </span>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center text-secondary-text border border-dashed border-warm-beige rounded-2xl">
                No orders match this status filter.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map(order => {
                  const currentCourier = dispatchData[order.id]?.courier || 'Blue Dart Express';
                  const currentTracking = dispatchData[order.id]?.tracking || `TRK${order.orderNumber.replace(/[^0-9]/g, '')}`;

                  return (
                    <div
                      key={order.id}
                      className="p-5 rounded-2xl bg-card border border-warm-beige hover:border-muted-gold shadow-sm transition-all space-y-4"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs pb-3 border-b border-warm-beige">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-black text-sm text-deep-green">
                            {order.orderNumber}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-warm-beige text-deep-green font-bold border border-sage/40">
                            {order.paymentMode} ({order.paymentStatus})
                          </span>
                          <span className="text-secondary-text">
                            Placed {new Date(order.createdAt).toLocaleTimeString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-base font-black text-charcoal">
                            ₹{order.finalPayable}
                          </span>
                          <button
                            onClick={() => setPrintOrder(order)}
                            className="p-1.5 rounded-lg bg-warm-beige hover:bg-warm-beige-dark text-charcoal"
                            title="Print Slip"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Customer and Destination */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1 text-secondary-text">
                          <p className="font-bold text-charcoal">
                            {order.customerName} ({order.customerPhone})
                          </p>
                          <p>{order.shippingAddress.street}</p>
                          <p>
                            {order.shippingAddress.city}, {order.shippingAddress.state} - <strong>{order.shippingAddress.pincode}</strong>
                          </p>
                        </div>

                        {/* Items list */}
                        <div className="bg-cream p-3 rounded-xl border border-warm-beige space-y-1.5">
                          <span className="text-[10px] font-bold text-secondary-text uppercase tracking-wider block">
                            Order Items:
                          </span>
                          {order.items.map((it: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center text-[11px]">
                              <span className="text-charcoal font-bold">
                                {it.quantity}x {it.productName} ({it.color})
                              </span>
                              <span className="text-[11px] font-bold text-deep-green font-mono">
                                ₹{it.price * it.quantity}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Actions by status */}
                      <div className="pt-3 border-t border-warm-beige flex flex-wrap items-center justify-between gap-3">
                        <div className="text-xs">
                          <span className="text-secondary-text">Status: </span>
                          <strong className="text-deep-green">{order.status}</strong>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {order.status === 'ORDER_PLACED' && (
                            <button
                              onClick={() => handleApprove(order.id)}
                              className="px-4 py-2 rounded-xl bg-deep-green hover:bg-deep-green-hover text-cream font-bold text-xs shadow-sm flex items-center gap-1.5 border border-deep-green-light"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-muted-gold" />
                              <span>Approve & Route to Godown</span>
                            </button>
                          )}

                          {order.status === 'APPROVED_TO_GODOWN' && (
                            <button
                              onClick={() => handlePack(order.id)}
                              className="px-4 py-2 rounded-xl bg-deep-green hover:bg-deep-green-hover text-cream font-bold text-xs shadow-sm flex items-center gap-1.5 border border-deep-green-light"
                            >
                              <Package className="w-3.5 h-3.5 text-muted-gold" />
                              <span>Pack Order & Move to Dispatch</span>
                            </button>
                          )}

                          {order.status === 'PACKED_READY_FOR_DISPATCH' && (
                            <div className="flex items-center gap-2">
                              <select
                                value={currentCourier}
                                onChange={e =>
                                  setDispatchData(prev => ({
                                    ...prev,
                                    [order.id]: { courier: e.target.value, tracking: currentTracking }
                                  }))
                                }
                                className="bg-cream border border-warm-beige rounded-lg px-2 py-1.5 text-xs font-semibold text-charcoal"
                              >
                                <option value="Blue Dart Express">Blue Dart Express</option>
                                <option value="DTDC Courier">DTDC Express</option>
                                <option value="Delhivery Surface">Delhivery Surface</option>
                                <option value="Local Homely Express">Local Homely Express</option>
                              </select>

                              <input
                                type="text"
                                value={currentTracking}
                                onChange={e =>
                                  setDispatchData(prev => ({
                                    ...prev,
                                    [order.id]: { courier: currentCourier, tracking: e.target.value }
                                  }))
                                }
                                placeholder="AWB Number"
                                className="bg-cream border border-warm-beige rounded-lg px-2.5 py-1.5 text-xs font-mono w-32 text-charcoal"
                              />

                              <button
                                onClick={() => handleDispatch(order.id)}
                                className="px-4 py-2 rounded-xl bg-deep-green hover:bg-deep-green-hover text-cream font-bold text-xs shadow-sm flex items-center gap-1.5 border border-deep-green-light"
                              >
                                <Truck className="w-3.5 h-3.5 text-muted-gold" />
                                <span>Dispatch Order</span>
                              </button>
                            </div>
                          )}

                          {order.status === 'DISPATCHED' && (
                            <button
                              onClick={() => handleDeliver(order.id)}
                              className="px-4 py-2 rounded-xl bg-deep-green hover:bg-deep-green-hover text-cream font-bold text-xs shadow-sm flex items-center gap-1.5"
                            >
                              <Check className="w-3.5 h-3.5 text-muted-gold" />
                              <span>Mark Delivered</span>
                            </button>
                          )}

                          {/* WhatsApp Customer Button */}
                          <button
                            onClick={() => {
                              const cleanPhone = (order.customerPhone || '').replace(/[^0-9]/g, '');
                              const msg = encodeURIComponent(
                                `Hello ${order.customerName}! Your Homely Order (${order.orderNumber}) is currently in status: ${order.status}. Track live: http://localhost:3000/account`
                              );
                              window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
                            }}
                            className="px-3 py-2 rounded-xl bg-warm-beige hover:bg-warm-beige-dark text-deep-green border border-sage/60 font-bold text-xs"
                          >
                            <span>WhatsApp</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Product Management */}
        {activeTab === 'PRODUCTS' && (
          <div className="bg-card rounded-b-2xl p-6 border-x border-b border-warm-beige shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-warm-beige">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-secondary-text absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search catalog..."
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  className="w-full bg-cream border border-warm-beige rounded-xl pl-9 pr-3 py-2 text-xs text-charcoal focus:outline-none focus:border-deep-green focus:bg-card"
                />
              </div>

              <button
                onClick={() => {
                  setEditingProduct(null);
                  setProductForm({
                    name: '',
                    category: 'casseroles',
                    brand: 'Homely',
                    badge: 'GRAND FESTIVE OFFER',
                    description: '',
                    imageUrl: '/products/master_casserole.png',
                    mrp: 1800,
                    offerPrice: 1250,
                    stockQty: 30,
                    colors: 'Sapphire Blue, Pearl White, Rose Gold',
                    capacity: '1500ml + 3500ml'
                  });
                  setIsAddProductOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-deep-green hover:bg-deep-green-hover text-cream font-bold text-xs shadow-md shadow-deep-green/20 flex items-center gap-1.5 self-start sm:self-auto border border-deep-green-light"
              >
                <Plus className="w-4 h-4 text-muted-gold" />
                <span>Add New Product</span>
              </button>
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b-2 border-warm-beige text-secondary-text font-bold uppercase text-[10px]">
                    <th className="py-3">Product</th>
                    <th className="py-3">Category</th>
                    <th className="py-3">Pricing (Offer / MRP)</th>
                    <th className="py-3 text-center">Stock</th>
                    <th className="py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warm-beige">
                  {filteredProducts.map(p => {
                    const v = p.variants[0] || {};
                    return (
                      <tr key={p.id} className="hover:bg-cream/50">
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-cream border border-warm-beige p-1 shrink-0 flex items-center justify-center">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={p.imageUrl}
                                alt={p.name}
                                className="max-h-full max-w-full object-contain"
                              />
                            </div>
                            <div>
                              <p className="font-bold text-charcoal line-clamp-1">{p.name}</p>
                              <span className="text-[10px] text-secondary-text font-mono">
                                SKU: {v.sku}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded bg-warm-beige text-deep-green font-bold text-[10px] uppercase">
                            {p.category}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="font-bold text-charcoal">
                            ₹{v.offerPrice}{' '}
                            <span className="text-[10px] text-secondary-text line-through font-normal">
                              ₹{v.mrp}
                            </span>
                          </div>
                          <span className="text-[10px] text-muted-gold-dark font-bold">
                            {v.discountPct}% OFF
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleAdjustStock(p.id, -1)}
                              className="w-5 h-5 rounded bg-warm-beige hover:bg-warm-beige-dark font-bold text-charcoal flex items-center justify-center"
                            >
                              -
                            </button>
                            <span
                              className={`font-black px-1.5 ${
                                (v.stockQty || 0) < 10
                                  ? 'text-rose-600'
                                  : 'text-charcoal'
                              }`}
                            >
                              {v.stockQty}
                            </span>
                            <button
                              onClick={() => handleAdjustStock(p.id, 1)}
                              className="w-5 h-5 rounded bg-warm-beige hover:bg-warm-beige-dark font-bold text-charcoal flex items-center justify-center"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setProductForm({
                                  name: p.name,
                                  category: p.category,
                                  brand: p.brand,
                                  badge: p.badge,
                                  description: p.description,
                                  imageUrl: p.imageUrl,
                                  mrp: v.mrp,
                                  offerPrice: v.offerPrice,
                                  stockQty: v.stockQty,
                                  colors: (v.colors || []).join(', '),
                                  capacity: v.capacity || ''
                                });
                                setIsAddProductOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-warm-beige hover:bg-warm-beige-dark text-charcoal"
                              title="Edit"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Coupons Engine */}
        {activeTab === 'COUPONS' && (
          <div className="bg-card rounded-b-2xl p-6 border-x border-b border-warm-beige shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-warm-beige">
              <div>
                <h3 className="font-bold text-sm text-charcoal">Active Promotion Codes</h3>
                <p className="text-xs text-secondary-text">Manage festival discounts and checkout offers.</p>
              </div>
              <button
                onClick={() => setIsAddCouponOpen(true)}
                className="px-4 py-2 rounded-xl bg-deep-green hover:bg-deep-green-hover text-cream font-bold text-xs shadow-md shadow-deep-green/20 flex items-center gap-1.5 border border-deep-green-light"
              >
                <Plus className="w-4 h-4 text-muted-gold" />
                <span>Create New Coupon</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {coupons.map(c => (
                <div
                  key={c.code}
                  className="p-4 rounded-xl bg-cream border border-warm-beige space-y-2 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-sm text-deep-green bg-warm-beige px-2 py-0.5 rounded border border-sage/40">
                      {c.code}
                    </span>
                    <button
                      onClick={() => handleDeleteCoupon(c.code)}
                      className="text-rose-500 hover:text-rose-700 p-1"
                      title="Delete Coupon"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-secondary-text">{c.description}</p>

                  <div className="pt-2 border-t border-warm-beige flex justify-between text-[11px] font-semibold text-secondary-text">
                    <span>Discount: <strong className="text-deep-green">{c.value}{c.discountType === 'percentage' ? '%' : '₹'}</strong></span>
                    <span>Min Order: <strong className="text-charcoal">₹{c.minOrder}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* Add / Edit Product Modal */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-charcoal/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-card rounded-2xl shadow-2xl border border-warm-beige overflow-hidden">
            <div className="p-4 bg-deep-green text-cream flex items-center justify-between border-b border-deep-green-light">
              <h3 className="font-bold text-sm text-cream">
                {editingProduct ? 'Edit Product' : 'Add New Product to Catalog'}
              </h3>
              <button
                onClick={() => setIsAddProductOpen(false)}
                className="p-1 rounded-lg text-sage hover:text-cream"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div>
                <label className="font-semibold text-secondary-text block mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="e.g. Royal Insulated Casserole Set"
                  className="w-full bg-cream border border-warm-beige rounded-xl px-3 py-2 text-charcoal focus:outline-none focus:border-deep-green focus:bg-card"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-secondary-text block mb-1">Category</label>
                  <select
                    value={productForm.category}
                    onChange={e => setProductForm({ ...productForm, category: e.target.value as any })}
                    className="w-full bg-cream border border-warm-beige rounded-xl px-3 py-2 text-charcoal font-bold focus:outline-none focus:border-deep-green"
                  >
                    <option value="casseroles">Insulated Casseroles</option>
                    <option value="combos">Festive Combos</option>
                    <option value="containers">Storage Containers</option>
                    <option value="household">Household Essentials</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-secondary-text block mb-1">Badge</label>
                  <input
                    type="text"
                    value={productForm.badge}
                    onChange={e => setProductForm({ ...productForm, badge: e.target.value })}
                    className="w-full bg-cream border border-warm-beige rounded-xl px-3 py-2 text-charcoal"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-secondary-text block mb-1">MRP (₹)</label>
                  <input
                    type="number"
                    required
                    value={productForm.mrp}
                    onChange={e => setProductForm({ ...productForm, mrp: Number(e.target.value) })}
                    className="w-full bg-cream border border-warm-beige rounded-xl px-3 py-2 text-charcoal font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-secondary-text block mb-1">Offer Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={productForm.offerPrice}
                    onChange={e => setProductForm({ ...productForm, offerPrice: Number(e.target.value) })}
                    className="w-full bg-cream border border-warm-beige rounded-xl px-3 py-2 text-deep-green font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-secondary-text block mb-1">Stock Qty</label>
                  <input
                    type="number"
                    required
                    value={productForm.stockQty}
                    onChange={e => setProductForm({ ...productForm, stockQty: Number(e.target.value) })}
                    className="w-full bg-cream border border-warm-beige rounded-xl px-3 py-2 text-charcoal font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-secondary-text block mb-1">Available Colors (comma separated)</label>
                <input
                  type="text"
                  value={productForm.colors}
                  onChange={e => setProductForm({ ...productForm, colors: e.target.value })}
                  placeholder="Sapphire Blue, Pearl White, Rose Gold"
                  className="w-full bg-cream border border-warm-beige rounded-xl px-3 py-2 text-charcoal"
                />
              </div>

              <div>
                <label className="font-semibold text-secondary-text block mb-1">Product Description</label>
                <textarea
                  rows={2}
                  value={productForm.description}
                  onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full bg-cream border border-warm-beige rounded-xl px-3 py-2 text-charcoal"
                  placeholder="Short description for product card..."
                />
              </div>

              <div className="pt-3 border-t border-warm-beige flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2 rounded-xl bg-warm-beige text-charcoal font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-deep-green hover:bg-deep-green-hover text-cream font-bold shadow-md shadow-deep-green/20"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Coupon Modal */}
      {isAddCouponOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-charcoal/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-card rounded-2xl shadow-2xl border border-warm-beige overflow-hidden">
            <div className="p-4 bg-deep-green text-cream flex items-center justify-between border-b border-deep-green-light">
              <h3 className="font-bold text-sm text-cream">Create New Promotional Coupon</h3>
              <button
                onClick={() => setIsAddCouponOpen(false)}
                className="p-1 rounded-lg text-sage hover:text-cream"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-secondary-text block mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DIWALIEXTRA"
                  value={couponForm.code}
                  onChange={e => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  className="w-full bg-cream border border-warm-beige rounded-xl px-3 py-2 text-deep-green font-mono font-black uppercase"
                />
              </div>

              <div>
                <label className="font-semibold text-secondary-text block mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Extra 15% festive discount"
                  value={couponForm.description}
                  onChange={e => setCouponForm({ ...couponForm, description: e.target.value })}
                  className="w-full bg-cream border border-warm-beige rounded-xl px-3 py-2 text-charcoal"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-secondary-text block mb-1">Discount Type</label>
                  <select
                    value={couponForm.discountType}
                    onChange={e => setCouponForm({ ...couponForm, discountType: e.target.value as any })}
                    className="w-full bg-cream border border-warm-beige rounded-xl px-3 py-2 text-charcoal font-bold"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-secondary-text block mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    value={couponForm.value}
                    onChange={e => setCouponForm({ ...couponForm, value: Number(e.target.value) })}
                    className="w-full bg-cream border border-warm-beige rounded-xl px-3 py-2 text-deep-green font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-secondary-text block mb-1">Minimum Order Amount (₹)</label>
                <input
                  type="number"
                  value={couponForm.minOrder}
                  onChange={e => setCouponForm({ ...couponForm, minOrder: Number(e.target.value) })}
                  className="w-full bg-cream border border-warm-beige rounded-xl px-3 py-2 text-charcoal font-mono"
                />
              </div>

              <div className="pt-3 border-t border-warm-beige flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCouponOpen(false)}
                  className="px-4 py-2 rounded-xl bg-warm-beige text-charcoal font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-deep-green hover:bg-deep-green-hover text-cream font-bold shadow-md shadow-deep-green/20"
                >
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Slip Modal */}
      <PrintSlipModal
        isOpen={!!printOrder}
        onClose={() => setPrintOrder(null)}
        order={printOrder}
      />
    </div>
  );
}
