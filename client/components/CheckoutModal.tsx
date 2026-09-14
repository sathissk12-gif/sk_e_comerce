'use client';

import React, { useState } from 'react';
import { X, CreditCard, Banknote, Zap, ShieldCheck, MapPin, Phone, User, CheckCircle2 } from 'lucide-react';
import { CartItem } from './CartDrawer';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  finalPayable: number;
  couponCode?: string;
  onOrderSuccess: (order: any) => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  finalPayable,
  couponCode,
  onOrderSuccess
}) => {
  const [name, setName] = useState('Sathish Kumar');
  const [phone, setPhone] = useState('+91 98410 12345');
  const [email, setEmail] = useState('sathish@example.com');
  const [street, setStreet] = useState('12, Gandhi Salai, T. Nagar');
  const [city, setCity] = useState('Chennai');
  const [state, setState] = useState('Tamil Nadu');
  const [pincode, setPincode] = useState('600017');

  const [paymentMode, setPaymentMode] = useState<'RAZORPAY' | 'COD' | 'TEST_PAY'>('RAZORPAY');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const submitOrderToBackend = async (
    mode: 'RAZORPAY' | 'COD' | 'TEST_PAY',
    rzpOrderId?: string,
    rzpPaymentId?: string
  ) => {
    const payload = {
      customerName: name,
      customerPhone: phone,
      customerEmail: email,
      shippingAddress: {
        street,
        city,
        state,
        pincode
      },
      items: cartItems.map(item => ({
        productId: item.product.id,
        variantId: item.variant.id,
        color: item.color,
        quantity: item.quantity
      })),
      couponCode: couponCode || undefined,
      paymentMode: mode,
      razorpayOrderId: rzpOrderId,
      razorpayPaymentId: rzpPaymentId
    };

    const res = await fetch('http://localhost:4000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to create order');
    }

    const data = await res.json();
    return data.order;
  };

  const handlePay = async () => {
    setErrorMsg('');
    if (!name || !phone || !street || !city || !pincode) {
      setErrorMsg('Please fill in all contact & shipping address fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (paymentMode === 'RAZORPAY') {
        const rzpRes = await fetch('http://localhost:4000/api/payments/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: finalPayable,
            receipt: `rcpt_ht_${Date.now()}`
          })
        });

        const rzpData = await rzpRes.json();
        const rzpOrderId = rzpData.orderId;
        const keyId = rzpData.keyId;

        if (typeof window !== 'undefined' && window.Razorpay) {
          const options = {
            key: keyId,
            amount: rzpData.amount,
            currency: 'INR',
            name: 'Homely Store',
            description: `Payment for ${cartItems.length} Items`,
            order_id: rzpOrderId,
            prefill: {
              name,
              email,
              contact: phone
            },
            theme: {
              color: '#173B32' // Deep Green
            },
            handler: async (response: any) => {
              try {
                await fetch('http://localhost:4000/api/payments/verify', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    razorpayOrderId: response.razorpay_order_id || rzpOrderId,
                    razorpayPaymentId: response.razorpay_payment_id || `pay_${Date.now()}`,
                    razorpaySignature: response.razorpay_signature || 'test_signature_valid'
                  })
                });

                const createdOrder = await submitOrderToBackend(
                  'RAZORPAY',
                  rzpOrderId,
                  response.razorpay_payment_id
                );
                setIsSubmitting(false);
                onOrderSuccess(createdOrder);
              } catch (err: any) {
                setErrorMsg(err.message || 'Payment verification failed');
                setIsSubmitting(false);
              }
            },
            modal: {
              ondismiss: () => {
                setIsSubmitting(false);
              }
            }
          };

          const rzpInstance = new window.Razorpay(options);
          rzpInstance.open();
          return;
        } else {
          const createdOrder = await submitOrderToBackend(
            'RAZORPAY',
            rzpOrderId,
            `pay_test_${Date.now()}`
          );
          setIsSubmitting(false);
          onOrderSuccess(createdOrder);
          return;
        }
      } else if (paymentMode === 'TEST_PAY') {
        const createdOrder = await submitOrderToBackend(
          'TEST_PAY',
          `order_sim_${Date.now()}`,
          `pay_sim_${Date.now()}`
        );
        setIsSubmitting(false);
        onOrderSuccess(createdOrder);
      } else {
        const createdOrder = await submitOrderToBackend('COD');
        setIsSubmitting(false);
        onOrderSuccess(createdOrder);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while placing your order.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-charcoal/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-card border border-warm-beige rounded-2xl shadow-2xl overflow-hidden text-charcoal">
        {/* Header - Deep Green */}
        <div className="p-4 bg-deep-green text-cream flex items-center justify-between border-b border-deep-green-light">
          <div>
            <h3 className="text-lg font-black tracking-tight">Express Checkout</h3>
            <p className="text-xs text-muted-gold">
              Total Payable: <strong className="text-cream font-black text-sm">₹{finalPayable}</strong> ({cartItems.length} items)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-sage hover:text-cream hover:bg-deep-green-light transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto bg-card">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* Customer Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-deep-green" />
              Customer Contact Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-secondary-text block mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-cream border border-warm-beige rounded-xl px-3 py-2 text-xs text-charcoal focus:outline-none focus:border-deep-green focus:bg-card"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-secondary-text block mb-1">Phone Number (SMS Alert)</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-cream border border-warm-beige rounded-xl px-3 py-2 text-xs text-charcoal focus:outline-none focus:border-deep-green focus:bg-card"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-secondary-text block mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-cream border border-warm-beige rounded-xl px-3 py-2 text-xs text-charcoal focus:outline-none focus:border-deep-green focus:bg-card"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="space-y-3 pt-3 border-t border-warm-beige">
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-deep-green" />
              Delivery Destination
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-3">
                <label className="text-[11px] font-semibold text-secondary-text block mb-1">Street / House No.</label>
                <input
                  type="text"
                  value={street}
                  onChange={e => setStreet(e.target.value)}
                  className="w-full bg-cream border border-warm-beige rounded-xl px-3 py-2 text-xs text-charcoal focus:outline-none focus:border-deep-green focus:bg-card"
                  placeholder="Door No, Street Name, Area"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-secondary-text block mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full bg-cream border border-warm-beige rounded-xl px-3 py-2 text-xs text-charcoal focus:outline-none focus:border-deep-green focus:bg-card"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-secondary-text block mb-1">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={e => setState(e.target.value)}
                  className="w-full bg-cream border border-warm-beige rounded-xl px-3 py-2 text-xs text-charcoal focus:outline-none focus:border-deep-green focus:bg-card"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-secondary-text block mb-1">Pincode</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={e => setPincode(e.target.value)}
                  className="w-full bg-cream border border-warm-beige rounded-xl px-3 py-2 text-xs text-charcoal focus:outline-none focus:border-deep-green focus:bg-card"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-3 pt-3 border-t border-warm-beige">
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-deep-green" />
              Select Payment Method
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Razorpay Online */}
              <div
                onClick={() => setPaymentMode('RAZORPAY')}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  paymentMode === 'RAZORPAY'
                    ? 'bg-warm-beige border-deep-green text-charcoal ring-2 ring-deep-green/30 shadow-sm'
                    : 'bg-card border-warm-beige text-secondary-text hover:border-sage'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-charcoal">Razorpay</span>
                  <div className="w-2 h-2 rounded-full bg-deep-green animate-pulse" />
                </div>
                <p className="text-[10px] text-secondary-text mt-1">
                  UPI (GPay / PhonePe), Cards & NetBanking
                </p>
                <span className="text-[9px] font-black text-deep-green mt-2 uppercase tracking-wide">
                  Recommended
                </span>
              </div>

              {/* Instant Test Checkout */}
              <div
                onClick={() => setPaymentMode('TEST_PAY')}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  paymentMode === 'TEST_PAY'
                    ? 'bg-warm-beige border-deep-green text-charcoal ring-2 ring-deep-green/30 shadow-sm'
                    : 'bg-card border-warm-beige text-secondary-text hover:border-sage'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-charcoal">Demo Fast Pay</span>
                  <Zap className="w-3.5 h-3.5 text-muted-gold" />
                </div>
                <p className="text-[10px] text-secondary-text mt-1">
                  1-Click instant test checkout for sandbox
                </p>
                <span className="text-[9px] font-black text-deep-green mt-2 uppercase tracking-wide">
                  Instant Test
                </span>
              </div>

              {/* Cash on Delivery */}
              <div
                onClick={() => setPaymentMode('COD')}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  paymentMode === 'COD'
                    ? 'bg-warm-beige border-deep-green text-charcoal ring-2 ring-deep-green/30 shadow-sm'
                    : 'bg-card border-warm-beige text-secondary-text hover:border-sage'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-charcoal">Cash on Delivery</span>
                  <Banknote className="w-3.5 h-3.5 text-secondary-text" />
                </div>
                <p className="text-[10px] text-secondary-text mt-1">
                  Pay cash at doorstep upon physical delivery
                </p>
                <span className="text-[9px] font-bold text-secondary-text mt-2">
                  Standard COD
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-4 bg-warm-beige/40 border-t border-warm-beige flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-secondary-text font-medium">
            <ShieldCheck className="w-4 h-4 text-deep-green" />
            <span>256-bit Encrypted SSL</span>
          </div>

          <button
            onClick={handlePay}
            disabled={isSubmitting}
            className="px-6 py-3 rounded-xl bg-deep-green hover:bg-deep-green-hover text-cream font-black text-sm shadow-lg shadow-deep-green/25 transition-all active:scale-95 disabled:opacity-50 border border-deep-green-light"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-cream border-t-transparent rounded-full animate-spin" />
                Processing Order...
              </span>
            ) : paymentMode === 'RAZORPAY' ? (
              `Pay ₹${finalPayable} via Razorpay`
            ) : paymentMode === 'TEST_PAY' ? (
              `Complete 1-Click Order (₹${finalPayable})`
            ) : (
              `Place COD Order (₹${finalPayable})`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
