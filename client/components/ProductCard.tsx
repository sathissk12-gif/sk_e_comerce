'use client';

import React, { useState } from 'react';
import { ShoppingCart, Check, Package, Sparkles } from 'lucide-react';

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  capacity?: string;
  colors: string[];
  mrp: number;
  offerPrice: number;
  discountPct: number;
  casePackQty?: number;
  packingType?: string;
  stockQty: number;
  rackLocation: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  badge: string;
  imageUrl: string;
  isCombo: boolean;
  comboIncludes?: string[];
  variants: ProductVariant[];
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, variant: ProductVariant, selectedColor: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const currentVariant = product.variants[selectedVariantIndex] || product.variants[0];

  const [selectedColor, setSelectedColor] = useState(
    currentVariant.colors[0] || 'Standard'
  );
  const [isAdded, setIsAdded] = useState(false);

  const handleVariantChange = (idx: number) => {
    setSelectedVariantIndex(idx);
    const newVariant = product.variants[idx];
    if (newVariant && newVariant.colors && newVariant.colors.length > 0) {
      setSelectedColor(newVariant.colors[0]);
    }
  };

  const handleAdd = () => {
    onAddToCart(product, currentVariant, selectedColor);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const savings = currentVariant.mrp - currentVariant.offerPrice;

  return (
    <div className="group relative flex flex-col bg-card rounded-2xl overflow-hidden border border-warm-beige hover:border-muted-gold shadow-sm hover:shadow-xl transition-all duration-300">
      {/* Festive Offer Badge */}
      <div className="absolute top-3 left-3 z-10">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-deep-green text-[10px] font-black tracking-wide text-muted-gold uppercase shadow-sm border border-muted-gold/30">
          <Sparkles className="w-3 h-3 text-muted-gold" />
          {product.badge || 'FESTIVE OFFER'}
        </span>
      </div>

      {/* Stock status indicator */}
      <div className="absolute top-3 right-3 z-10">
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
            currentVariant.stockQty > 10
              ? 'bg-sage-light text-deep-green border-sage/60'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}
        >
          {currentVariant.stockQty > 0 ? `${currentVariant.stockQty} in Stock` : 'Out of Stock'}
        </span>
      </div>

      {/* Product Image Area */}
      <div className="relative w-full aspect-[4/3] bg-gradient-to-b from-cream to-card p-4 overflow-hidden flex items-center justify-center border-b border-warm-beige">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageUrl}
          alt={product.name}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-sm"
          loading="lazy"
        />
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-card">
        <div>
          <div className="text-[11px] font-black uppercase tracking-wider text-deep-green">
            {product.brand} • {product.category}
          </div>

          <h3 className="font-black text-base text-charcoal line-clamp-1 group-hover:text-deep-green transition-colors mt-0.5">
            {product.name}
          </h3>

          <p className="text-xs text-secondary-text line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>

          {/* Combo Highlights */}
          {product.isCombo && product.comboIncludes && (
            <div className="mt-2 flex flex-wrap gap-1">
              {product.comboIncludes.map((inc, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 text-[10px] bg-warm-beige border border-sage/40 text-deep-green px-2 py-0.5 rounded-md font-bold"
                >
                  <Package className="w-2.5 h-2.5 text-muted-gold" />
                  {inc}
                </span>
              ))}
            </div>
          )}

          {/* Variants Selector */}
          {product.variants.length > 1 && (
            <div className="mt-2.5">
              <label className="text-[10px] text-secondary-text uppercase font-bold block mb-1">
                Select Size / Set:
              </label>
              <div className="flex flex-wrap gap-1">
                {product.variants.map((v, i) => (
                  <button
                    key={v.id}
                    onClick={() => handleVariantChange(i)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                      selectedVariantIndex === i
                        ? 'bg-deep-green text-cream font-black border-deep-green shadow-sm'
                        : 'bg-warm-beige/60 text-charcoal border-warm-beige hover:bg-warm-beige'
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selection */}
          {currentVariant.colors && currentVariant.colors.length > 0 && (
            <div className="mt-2.5">
              <div className="flex items-center justify-between text-[10px] text-secondary-text font-bold mb-1">
                <span>COLOR:</span>
                <span className="text-deep-green font-black">{selectedColor}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {currentVariant.colors.map(col => (
                  <button
                    key={col}
                    onClick={() => setSelectedColor(col)}
                    className={`text-[11px] px-2.5 py-0.5 rounded-full border transition-all ${
                      selectedColor === col
                        ? 'bg-warm-beige text-deep-green border-deep-green font-black ring-1 ring-deep-green'
                        : 'bg-cream text-secondary-text border-warm-beige hover:text-charcoal hover:bg-warm-beige/50'
                    }`}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pricing & Add to Cart */}
        <div className="pt-3 border-t border-warm-beige">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-deep-green">
                  ₹{currentVariant.offerPrice}
                </span>
                {savings > 0 && (
                  <span className="text-xs text-secondary-text line-through">
                    MRP ₹{currentVariant.mrp}
                  </span>
                )}
              </div>
              {savings > 0 ? (
                <span className="text-[10px] font-bold text-muted-gold-dark">
                  Save ₹{savings} ({currentVariant.discountPct}% OFF)
                </span>
              ) : (
                <span className="text-[10px] font-bold text-secondary-text">
                  Catalogue MRP: ₹{currentVariant.mrp}
                </span>
              )}
              {currentVariant.casePackQty && (
                <div className="text-[9px] font-bold text-deep-green/80 mt-0.5">
                  📦 Case Pack: {currentVariant.casePackQty} Pcs ({currentVariant.packingType || 'Box'})
                </div>
              )}
            </div>

            <button
              onClick={handleAdd}
              disabled={currentVariant.stockQty <= 0}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 ${
                isAdded
                  ? 'bg-sage text-deep-green font-black'
                  : currentVariant.stockQty <= 0
                  ? 'bg-warm-beige text-secondary-text cursor-not-allowed'
                  : 'bg-deep-green hover:bg-deep-green-hover text-cream shadow-deep-green/20'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5 text-muted-gold" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
