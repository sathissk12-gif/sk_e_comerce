'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { ProductCard, Product, ProductVariant } from '../../components/ProductCard';
import { CartDrawer, CartItem } from '../../components/CartDrawer';
import { CheckoutModal } from '../../components/CheckoutModal';
import { OrderTrackerModal } from '../../components/OrderTrackerModal';
import {
  Search,
  Sparkles,
  SlidersHorizontal,
  PackageCheck,
  RotateCcw,
  Check
} from 'lucide-react';
import { io } from 'socket.io-client';
import { getApiBaseUrl } from '../../lib/api';

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState<'all' | 'under500' | '500to1000' | '1000to1500' | 'above1500'>('all');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'priceLow' | 'priceHigh' | 'discount'>('featured');
  const [isWsConnected, setIsWsConnected] = useState(false);

  // Cart & Modals
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);

  // Coupons
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setActiveCategory(cat);
    }
    const q = searchParams.get('search');
    if (q !== null && q !== undefined) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/products`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (e) {
      console.warn('API fetch error:', e);
    }
  };

  useEffect(() => {
    fetchProducts();

    const socket = io(getApiBaseUrl(), {
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => setIsWsConnected(true));
    socket.on('disconnect', () => setIsWsConnected(false));

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    let list = [...products];

    if (activeCategory !== 'all') {
      list = list.filter(p => p.category.toLowerCase() === activeCategory.toLowerCase());
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q)
      );
    }

    if (priceFilter === 'under500') {
      list = list.filter(p => p.variants[0]?.offerPrice < 500);
    } else if (priceFilter === '500to1000') {
      list = list.filter(p => p.variants[0]?.offerPrice >= 500 && p.variants[0]?.offerPrice <= 1000);
    } else if (priceFilter === '1000to1500') {
      list = list.filter(p => p.variants[0]?.offerPrice > 1000 && p.variants[0]?.offerPrice <= 1500);
    } else if (priceFilter === 'above1500') {
      list = list.filter(p => p.variants[0]?.offerPrice > 1500);
    }

    if (inStockOnly) {
      list = list.filter(p => (p.variants[0]?.stockQty || 0) > 0);
    }

    if (sortBy === 'priceLow') {
      list.sort((a, b) => (a.variants[0]?.offerPrice || 0) - (b.variants[0]?.offerPrice || 0));
    } else if (sortBy === 'priceHigh') {
      list.sort((a, b) => (b.variants[0]?.offerPrice || 0) - (a.variants[0]?.offerPrice || 0));
    } else if (sortBy === 'discount') {
      list.sort((a, b) => (b.variants[0]?.discountPct || 0) - (a.variants[0]?.discountPct || 0));
    }

    setFilteredProducts(list);
  }, [products, activeCategory, searchQuery, priceFilter, inStockOnly, sortBy]);

  const handleAddToCart = (product: Product, variant: ProductVariant, color: string) => {
    setCartItems(prev => {
      const key = `${product.id}-${variant.id}-${color}`;
      const existing = prev.find(item => item.id === key);
      if (existing) {
        return prev.map(item =>
          item.id === key ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [
          ...prev,
          {
            id: key,
            product,
            variant,
            color,
            quantity: 1
          }
        ];
      }
    });
  };

  const handleUpdateQty = (key: string, delta: number) => {
    setCartItems(prev =>
      prev
        .map(item => {
          if (item.id === key) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (key: string) => {
    setCartItems(prev => prev.filter(item => item.id !== key));
  };

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.variant.offerPrice * item.quantity,
    0
  );

  const handleApplyCoupon = async (code: string) => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, cartTotal })
      });
      const data = await res.json();
      if (data.valid) {
        setCouponCode(data.code);
        setCouponDiscount(data.discountAmount);
        setCouponMessage(data.message);
        return true;
      } else {
        setCouponMessage(data.message);
        return false;
      }
    } catch (e) {
      setCouponMessage('Error validating coupon');
      return false;
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setCouponDiscount(0);
    setCouponMessage('');
  };

  const finalPayable = Math.max(0, cartTotal - couponDiscount);

  const handleOrderSuccess = (newOrder: any) => {
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setCartItems([]);
    handleRemoveCoupon();
    setTrackingOrderId(newOrder.id);
    setIsTrackerOpen(true);
  };

  const categories = [
    { id: 'all', label: 'All Products' },
    { id: 'casseroles', label: 'Insulated Casseroles' },
    { id: 'combos', label: 'Combos & Gift Sets' },
    { id: 'tiffins', label: 'Lunch Boxes & Tiffins' },
    { id: 'bottles', label: 'Water Bottles & Jugs' },
    { id: 'coolers', label: 'Thermo Wagon Coolers' },
    { id: 'containers', label: 'Airtight Storage Jars' },
    { id: 'organizers', label: 'Boxes & Organizers' },
    { id: 'household', label: 'Household & Pedal Bins' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-cream text-charcoal">
      {/* Navbar */}
      <Navbar
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        cartTotal={cartTotal}
        onOpenCart={() => setIsCartOpen(true)}
        isWsConnected={isWsConnected}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Page Header */}
        <div className="pb-6 border-b border-warm-beige">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-deep-green text-xs font-black uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5 text-muted-gold" />
                <span>Homely Catalog • 2026 Collection</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-charcoal tracking-tight">
                Shop Festive Essentials
              </h1>
            </div>

            {/* Top Search Bar */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-secondary-text absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search products, sizes, combos..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-card border border-warm-beige rounded-xl pl-10 pr-4 py-2 text-xs text-charcoal placeholder-secondary-text focus:outline-none focus:border-deep-green focus:ring-1 focus:ring-deep-green shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Main Content Layout: Sidebar + Grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Sidebar Filters */}
          <aside className="bg-card rounded-2xl p-5 border border-warm-beige shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-warm-beige">
              <div className="flex items-center gap-2 font-bold text-sm text-charcoal">
                <SlidersHorizontal className="w-4 h-4 text-deep-green" />
                <span>Filters</span>
              </div>
              {(activeCategory !== 'all' || priceFilter !== 'all' || inStockOnly || searchQuery) && (
                <button
                  onClick={() => {
                    setActiveCategory('all');
                    setPriceFilter('all');
                    setInStockOnly(false);
                    setSearchQuery('');
                  }}
                  className="text-xs text-deep-green hover:text-deep-green-hover font-bold flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-secondary-text block">
                Categories
              </label>
              <div className="space-y-1">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                      activeCategory === cat.id
                        ? 'bg-warm-beige text-deep-green border border-sage/60 font-black'
                        : 'text-secondary-text hover:bg-cream hover:text-charcoal'
                    }`}
                  >
                    <span>{cat.label}</span>
                    {activeCategory === cat.id && <Check className="w-3.5 h-3.5 text-deep-green" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="space-y-2 pt-4 border-t border-warm-beige">
              <label className="text-xs font-bold uppercase tracking-wider text-secondary-text block">
                Price Range
              </label>
              <div className="space-y-1 text-xs">
                {[
                  { id: 'all', label: 'All Prices' },
                  { id: 'under500', label: 'Under ₹500' },
                  { id: '500to1000', label: '₹500 - ₹1,000' },
                  { id: '1000to1500', label: '₹1,000 - ₹1,500' },
                  { id: 'above1500', label: 'Above ₹1,500' }
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => setPriceFilter(p.id as any)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg font-medium transition-all ${
                      priceFilter === p.id
                        ? 'bg-warm-beige text-deep-green font-bold'
                        : 'text-secondary-text hover:text-charcoal hover:bg-cream'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="pt-4 border-t border-warm-beige">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-charcoal">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={e => setInStockOnly(e.target.checked)}
                  className="rounded text-deep-green focus:ring-deep-green w-4 h-4 border-warm-beige"
                />
                <span>In-Stock Items Only</span>
              </label>
            </div>
          </aside>

          {/* Product Grid Area */}
          <div className="lg:col-span-3 space-y-4">
            {/* Sorting & Results Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-card rounded-xl border border-warm-beige shadow-sm text-xs">
              <span className="font-bold text-secondary-text">
                Showing <strong className="text-charcoal">{filteredProducts.length}</strong> products
              </span>

              <div className="flex items-center gap-2">
                <span className="text-secondary-text font-medium">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="bg-cream border border-warm-beige rounded-lg px-2.5 py-1.5 text-xs text-charcoal font-bold focus:outline-none focus:border-deep-green"
                >
                  <option value="featured">Featured Picks</option>
                  <option value="priceLow">Price: Low to High</option>
                  <option value="priceHigh">Price: High to Low</option>
                  <option value="discount">Biggest Discount %</option>
                </select>
              </div>
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>

            {/* Empty State */}
            {filteredProducts.length === 0 && (
              <div className="p-16 text-center bg-card border border-dashed border-warm-beige rounded-2xl space-y-3">
                <PackageCheck className="w-12 h-12 text-secondary-text/60 mx-auto" />
                <h3 className="font-bold text-base text-charcoal">No products found</h3>
                <p className="text-xs text-secondary-text max-w-sm mx-auto leading-relaxed">
                  We couldn't find any products matching your current filters. Try resetting the filters or modifying your search terms.
                </p>
                <button
                  onClick={() => {
                    setActiveCategory('all');
                    setPriceFilter('all');
                    setInStockOnly(false);
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-xl bg-deep-green text-cream font-bold text-xs shadow-md shadow-deep-green/20 active:scale-95"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        couponCode={couponCode}
        couponDiscount={couponDiscount}
        couponMessage={couponMessage}
        onApplyCoupon={handleApplyCoupon}
        onRemoveCoupon={handleRemoveCoupon}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        finalPayable={finalPayable}
        couponCode={couponCode}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Order Tracker Modal */}
      <OrderTrackerModal
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
        orderId={trackingOrderId}
      />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-secondary-text">Loading Shop...</div>}>
      <ShopContent />
    </Suspense>
  );
}
