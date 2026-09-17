'use client';

import React, { useState } from 'react';
import { X, Trash2, Tag, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { getApiBaseUrl } from '../lib/api';
import { Product, ProductVariant } from './ProductCard';

export interface CartItem {
  id: string; // unique key
  product: Product;
  variant: ProductVariant;
  color: string;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQty: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onProceedToCheckout: () => void;
  couponCode: string;
  couponDiscount: number;
  couponMessage: string;
  onApplyCoupon: (code: string) => Promise<boolean>;
  onRemoveCoupon: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQty,
  onRemoveItem,
  onProceedToCheckout,
  couponCode,
  couponDiscount,
  couponMessage,
  onApplyCoupon,
  onRemoveCoupon
}) => {
  const [inputCode, setInputCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  if (!isOpen) return null;

  const totalMrp = items.reduce(
    (sum, item) => sum + item.variant.mrp * item.quantity,
    0
  );
  const totalOfferPrice = items.reduce(
    (sum, item) => sum + item.variant.offerPrice * item.quantity,
    0
  );
  const bookletSavings = totalMrp - totalOfferPrice;
  const finalPayable = Math.max(0, totalOfferPrice - couponDiscount);

  const handleApply = async () => {
    if (!inputCode.trim()) return;
    setIsApplying(true);
    await onApplyCoupon(inputCode.trim());
    setIsApplying(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-card border-l border-warm-beige flex flex-col shadow-2xl">
          {/* Header - Deep Green */}
          <div className="p-4 bg-deep-green border-b border-deep-green-light flex items-center justify-between text-cream">
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight">Your Cart</span>
              <span className="px-2 py-0.5 rounded-full bg-muted-gold text-deep-green text-xs font-black">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-sage hover:text-cream hover:bg-deep-green-light transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List - Cream Background */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-cream">
            {items.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center space-y-3 text-secondary-text">
                <Sparkles className="w-12 h-12 text-muted-gold animate-pulse" />
                <p className="text-base font-bold text-charcoal">
                  Your cart is empty
                </p>
                <p className="text-xs text-secondary-text max-w-xs leading-relaxed">
                  Discover casseroles, gift combos, and storage sets from the Homely 2026 collection!
                </p>
              </div>
            ) : (
              items.map(item => {
                return (
                  <div
                    key={item.id}
                    className="flex gap-3 p-3 rounded-xl bg-card border border-warm-beige hover:border-muted-gold shadow-sm transition-all"
                  >
                    {/* Thumbnail */}
                    <div className="w-20 h-20 shrink-0 bg-cream rounded-lg p-1.5 overflow-hidden flex items-center justify-center border border-warm-beige">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.variant.imageUrl || item.product.imageUrl}
                        alt={item.product.name}
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          const target = e.currentTarget;
                          const fallbackImg = item.variant.imageUrl || item.product.imageUrl;
                          if (!target.dataset.retried) {
                            target.dataset.retried = '1';
                            target.src = `${fallbackImg}?v=${Date.now()}`;
                          } else if (target.dataset.retried === '1') {
                            target.dataset.retried = '2';
                            target.src = `${getApiBaseUrl()}${fallbackImg}`;
                          }
                        }}
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-charcoal line-clamp-1">
                          {item.product.name}
                        </h4>
                        <div className="text-[11px] text-secondary-text flex flex-wrap gap-1 mt-0.5">
                          {item.variant.capacity && (
                            <span className="font-medium">
                              {item.variant.capacity} •
                            </span>
                          )}
                          <span className="text-deep-green font-bold">
                            {item.color}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div>
                          <span className="font-black text-sm text-deep-green">
                            ₹{item.variant.offerPrice * item.quantity}
                          </span>
                          <span className="text-[10px] text-secondary-text line-through ml-1.5">
                            ₹{item.variant.mrp * item.quantity}
                          </span>
                        </div>

                        {/* Quantity Stepper */}
                        <div className="flex items-center gap-1.5 bg-warm-beige rounded-lg p-0.5 border border-sage/40">
                          <button
                            onClick={() => onUpdateQty(item.id, -1)}
                            className="w-5 h-5 flex items-center justify-center text-xs font-bold text-secondary-text hover:text-charcoal hover:bg-cream rounded"
                          >
                            -
                          </button>
                          <span className="text-xs font-black text-charcoal px-1">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQty(item.id, 1)}
                            className="w-5 h-5 flex items-center justify-center text-xs font-bold text-secondary-text hover:text-charcoal hover:bg-cream rounded"
                          >
                            +
                          </button>
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="w-5 h-5 flex items-center justify-center text-rose-600 hover:bg-rose-50 rounded ml-1"
                            title="Remove"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Coupon Code Section */}
          {items.length > 0 && (
            <div className="p-4 bg-card border-t border-warm-beige space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-muted-gold absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Enter coupon (e.g. DIWALI2026)"
                    value={inputCode}
                    onChange={e => setInputCode(e.target.value.toUpperCase())}
                    className="w-full bg-cream border border-warm-beige rounded-xl pl-9 pr-3 py-2 text-xs text-charcoal placeholder-secondary-text uppercase font-mono tracking-wider focus:outline-none focus:border-deep-green focus:bg-card"
                  />
                </div>
                <button
                  onClick={handleApply}
                  disabled={isApplying || !inputCode.trim()}
                  className="px-4 py-2 bg-deep-green hover:bg-deep-green-hover text-cream text-xs font-bold rounded-xl disabled:opacity-50 transition-all active:scale-95 shadow-sm shadow-deep-green/20"
                >
                  {isApplying ? 'Applying...' : 'Apply'}
                </button>
              </div>

              {couponMessage && (
                <div
                  className={`text-[11px] p-2 rounded-lg flex items-center justify-between font-medium ${
                    couponDiscount > 0
                      ? 'bg-sage-light text-deep-green border border-sage/60'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  <span>{couponMessage}</span>
                  {couponDiscount > 0 && (
                    <button
                      onClick={onRemoveCoupon}
                      className="text-xs underline text-secondary-text hover:text-charcoal ml-2 font-bold"
                    >
                      Remove
                    </button>
                  )}
                </div>
              )}

              {/* Suggested coupon tags */}
              {!couponCode && (
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="text-[10px] text-secondary-text self-center">Try:</span>
                  {['DIWALI2026', 'FESTIVE500', 'ONAMFREE'].map(c => (
                    <button
                      key={c}
                      onClick={() => {
                        setInputCode(c);
                        onApplyCoupon(c);
                      }}
                      className="text-[10px] px-2 py-0.5 rounded bg-warm-beige border border-sage/40 text-deep-green hover:bg-warm-beige-dark font-mono font-black transition-colors"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Footer & Checkout */}
          {items.length > 0 && (
            <div className="p-4 bg-warm-beige/50 border-t border-warm-beige space-y-3">
              <div className="space-y-1.5 text-xs text-secondary-text">
                <div className="flex justify-between">
                  <span>Total MRP:</span>
                  <span className="line-through text-secondary-text/70">₹{totalMrp}</span>
                </div>
                <div className="flex justify-between text-deep-green font-bold">
                  <span>Festive Discount Savings:</span>
                  <span>- ₹{bookletSavings}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-muted-gold-dark font-black">
                    <span>Coupon ({couponCode}):</span>
                    <span>- ₹{couponDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between text-secondary-text">
                  <span>Express Delivery:</span>
                  <span className="text-deep-green font-bold uppercase">FREE</span>
                </div>
                <div className="pt-2 border-t border-warm-beige flex justify-between items-baseline">
                  <span className="text-sm font-black text-charcoal">Final Payable:</span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-deep-green">
                      ₹{finalPayable}
                    </span>
                    <p className="text-[10px] text-muted-gold-dark font-bold">
                      Total Saved: ₹{bookletSavings + couponDiscount}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={onProceedToCheckout}
                className="w-full py-3.5 rounded-xl bg-deep-green hover:bg-deep-green-hover text-cream font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-deep-green/25 transition-all active:scale-98 border border-deep-green-light"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 text-muted-gold" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-secondary-text font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-muted-gold" />
                <span>100% Genuine Homely Quality Guarantee</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
