'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ProductCard, Product, ProductVariant } from '../components/ProductCard';
import { CartDrawer, CartItem } from '../components/CartDrawer';
import { CheckoutModal } from '../components/CheckoutModal';
import { OrderTrackerModal } from '../components/OrderTrackerModal';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Package,
  Truck,
  Layers,
  ChevronRight,
  Store
} from 'lucide-react';
import { io } from 'socket.io-client';
import { getApiBaseUrl } from '../lib/api';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
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

  // Fetch products
  useEffect(() => {
    fetch(`${getApiBaseUrl()}/api/products`)
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || []);
      })
      .catch(e => console.warn('Products fetch error:', e));

    const socket = io(getApiBaseUrl(), {
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => setIsWsConnected(true));
    socket.on('disconnect', () => setIsWsConnected(false));

    return () => {
      socket.disconnect();
    };
  }, []);

  // Cart Handlers
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

  const featuredProducts = products.slice(0, 4);

  const categories = [
    {
      id: 'casseroles',
      title: 'Insulated Casseroles',
      desc: 'Double-walled thermal sets with metallic gold finishes keeping food piping hot.',
      count: '9 Models',
      image: '/products/cat_master_casserole.png',
      badge: 'STAINLESS INNER'
    },
    {
      id: 'combos',
      title: 'Combos & Gift Sets',
      desc: 'All-in-one celebration bundles with casseroles, vacuum flasks, and carry boxes.',
      count: '5 Bundles',
      image: '/products/cat_elite_trio.png',
      badge: 'GIFT READY'
    },
    {
      id: 'tiffins',
      title: 'Lunch Boxes & Tiffins',
      desc: 'Insulated executive and kids lunch boxes with leak-proof stainless steel containers.',
      count: '6 Models',
      image: '/products/cat_urban_pack.png',
      badge: 'HOT MEAL'
    },
    {
      id: 'bottles',
      title: 'Bottles & Flasks',
      desc: 'Vacuum insulated stainless steel flasks, thumb grip gym bottles, and fridge PET sets.',
      count: '6 Series',
      image: '/products/cat_thumb_grip_bottle.png',
      badge: '24H HOT/COLD'
    },
    {
      id: 'coolers',
      title: 'Thermo Wagon Coolers',
      desc: 'Heavy-duty insulated ice cooler chests keeping beverages chilled for 24 hours.',
      count: '45L & 110L',
      image: '/products/cat_thermo_wagon_cooler.png',
      badge: '24H CHILL'
    },
    {
      id: 'containers',
      title: 'Airtight Storage Jars',
      desc: 'Crystal clear modular stackable containers and grain jars for pantry organization.',
      count: '3 Series',
      image: '/products/cat_clear_stack.png',
      badge: 'AIRTIGHT'
    },
    {
      id: 'organizers',
      title: 'Boxes & Organizers',
      desc: 'Heavy duty roller storage trunks with wheels and multi-tier drawer organisers.',
      count: '16L to 67L',
      image: '/products/cat_regal_roller.png',
      badge: 'WITH WHEELS'
    },
    {
      id: 'household',
      title: 'Pedal Bins & Household',
      desc: 'Hands-free hygiene foot pedal dustbins, anti-skid bathroom stools, and durable buckets.',
      count: '5 Series',
      image: '/products/cat_look_beautiful_dustbin.png',
      badge: 'DURABLE'
    }
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

      <main className="flex-1">
        {/* Modern Hero Section - Warm Beige / Cream */}
        <section className="relative overflow-hidden bg-gradient-to-b from-card via-cream to-warm-beige/60 border-b border-warm-beige py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-warm-beige border border-sage/50 text-deep-green text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-muted-gold" />
                  <span>Onam & Diwali Festive 2026 Collection</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-charcoal tracking-tight leading-[1.1]">
                  Elevate Festive Gifting with{' '}
                  <span className="text-deep-green">Homely</span>
                </h1>

                <p className="text-base sm:text-lg text-secondary-text max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                  Explore our authentic insulated casseroles, airtight kitchen storage, and festive combo gift sets engineered with food-grade virgin polymers and double-wall stainless steel liners.
                </p>

                {/* CTAs */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                  <Link
                    href="/shop"
                    className="px-7 py-3.5 rounded-xl bg-deep-green hover:bg-deep-green-hover text-cream font-black text-sm shadow-xl shadow-deep-green/25 flex items-center gap-2 transition-all active:scale-95 border border-deep-green-light"
                  >
                    <Store className="w-4 h-4 text-muted-gold" />
                    <span>Explore Shop Catalog</span>
                    <ArrowRight className="w-4 h-4 text-muted-gold" />
                  </Link>

                  <Link
                    href="/shop?category=combos"
                    className="px-6 py-3.5 rounded-xl bg-card hover:bg-warm-beige text-charcoal font-bold text-sm border border-warm-beige shadow-sm flex items-center gap-2 transition-all"
                  >
                    <span>Gift Combos</span>
                  </Link>
                </div>

                {/* Highlights Pills */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-warm-beige max-w-lg mx-auto lg:mx-0 text-left">
                  <div>
                    <span className="text-2xl font-black text-charcoal block">32% OFF</span>
                    <span className="text-xs text-secondary-text font-medium">Festive Booklet Offer</span>
                  </div>
                  <div>
                    <span className="text-2xl font-black text-deep-green block">100%</span>
                    <span className="text-xs text-secondary-text font-medium">Virgin Food-Grade</span>
                  </div>
                  <div>
                    <span className="text-2xl font-black text-muted-gold-dark block">Fast</span>
                    <span className="text-xs text-secondary-text font-medium">Godown Dispatch</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Hero Visual Card */}
              <div className="lg:col-span-5 relative">
                <div className="relative mx-auto max-w-md bg-card rounded-3xl p-6 border border-warm-beige shadow-2xl">
                  {/* Floating Tag */}
                  <div className="absolute -top-3 -right-3 z-10 bg-deep-green text-muted-gold font-black text-xs px-3.5 py-1.5 rounded-full shadow-lg border border-muted-gold/40">
                    HOT FESTIVE PICK
                  </div>

                  {/* Visual Image */}
                  <div className="w-full aspect-[4/3] bg-gradient-to-b from-cream to-card rounded-2xl p-4 flex items-center justify-center border border-warm-beige overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/products/master_casserole.png"
                      alt="Master Insulated Casserole Set"
                      className="max-h-full max-w-full object-contain drop-shadow-md hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="mt-5 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[11px] font-black text-deep-green uppercase tracking-wider">
                          Festive Casserole Set
                        </span>
                        <h3 className="font-bold text-lg text-charcoal">
                          Master Double-Walled Casserole
                        </h3>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-black text-deep-green block">₹1,287</span>
                        <span className="text-xs text-secondary-text line-through">MRP ₹1,885</span>
                      </div>
                    </div>

                    <p className="text-xs text-secondary-text leading-relaxed">
                      Set of 2 (1500ml + 3500ml) with metallic gold rims and mirror stainless steel liner.
                    </p>

                    <Link
                      href="/shop"
                      className="w-full mt-3 py-2.5 rounded-xl bg-deep-green hover:bg-deep-green-hover text-cream font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      <span>View All Festive Offers</span>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-gold" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-warm-beige">
            <div>
              <span className="text-xs font-black text-deep-green uppercase tracking-wider">
                Explore by Collection
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-charcoal tracking-tight mt-1">
                Curated Festive Categories
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-xs font-bold text-deep-green hover:text-deep-green-hover flex items-center gap-1 self-start md:self-end"
            >
              <span>View all products</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map(cat => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.id}`}
                className="group relative flex flex-col bg-card rounded-2xl border border-warm-beige hover:border-muted-gold shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="p-4 bg-cream aspect-[4/3] flex items-center justify-center overflow-hidden border-b border-warm-beige">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-300"
                  />
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-deep-green uppercase tracking-wider font-black">{cat.badge}</span>
                      <span className="text-secondary-text">{cat.count}</span>
                    </div>
                    <h3 className="font-bold text-base text-charcoal group-hover:text-deep-green transition-colors mt-1">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-secondary-text line-clamp-2 mt-1 leading-relaxed">
                      {cat.desc}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-deep-green group-hover:translate-x-1 transition-transform">
                    <span>Shop category</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Best Sellers Preview */}
        <section className="bg-card border-y border-warm-beige py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-warm-beige">
              <div>
                <span className="text-xs font-black text-deep-green uppercase tracking-wider">
                  Hand-Picked Specials
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-charcoal tracking-tight mt-1">
                  Festive Best-Sellers
                </h2>
              </div>
              <Link
                href="/shop"
                className="px-4 py-2 rounded-xl bg-warm-beige text-deep-green hover:bg-warm-beige-dark font-bold text-xs border border-sage/40 transition-colors"
              >
                Browse Complete Store →
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Homely Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-deep-green">
              Factory Precision & Craftsmanship
            </span>
            <h2 className="text-3xl font-black text-charcoal tracking-tight">
              Why Customers Trust Homely
            </h2>
            <p className="text-sm text-secondary-text leading-relaxed">
              Every piece in our catalog is engineered to withstand daily kitchen demands while radiating festive luxury for gifting.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-card border border-warm-beige shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-warm-beige text-deep-green flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-muted-gold" />
              </div>
              <h3 className="font-bold text-base text-charcoal">100% Food-Grade Virgin Polymers</h3>
              <p className="text-xs text-secondary-text leading-relaxed">
                BPA-free non-toxic plastics conforming to international food hygiene regulations.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-warm-beige shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-warm-beige text-deep-green flex items-center justify-center">
                <Layers className="w-6 h-6 text-muted-gold" />
              </div>
              <h3 className="font-bold text-base text-charcoal">Thermal Double-Wall Core</h3>
              <p className="text-xs text-secondary-text leading-relaxed">
                Seamless stainless steel 304 inner liner retaining food temperature for 4+ hours.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-warm-beige shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-warm-beige text-deep-green flex items-center justify-center">
                <Package className="w-6 h-6 text-muted-gold" />
              </div>
              <h3 className="font-bold text-base text-charcoal">Gift-Ready Carry Packaging</h3>
              <p className="text-xs text-secondary-text leading-relaxed">
                Festive color gift boxes fitted with reinforced carry handles, ready to present.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-warm-beige shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-warm-beige text-deep-green flex items-center justify-center">
                <Truck className="w-6 h-6 text-muted-gold" />
              </div>
              <h3 className="font-bold text-base text-charcoal">Direct Godown Fast Shipping</h3>
              <p className="text-xs text-secondary-text leading-relaxed">
                Allocated directly from inventory racks with real-time milestone AWB tracking.
              </p>
            </div>
          </div>
        </section>

        {/* Festive Gifting Strip */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="p-8 sm:p-12 rounded-3xl bg-deep-green text-cream border border-deep-green-light flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl">
            <div className="space-y-3 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-deep-green-light text-muted-gold font-bold text-xs border border-muted-gold/40">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Corporate & Family Gifting Portal</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-cream">
                Pre-Packaged Festive Gift Combos with Handles
              </h2>
              <p className="text-xs sm:text-sm text-sage max-w-xl leading-relaxed">
                Planning bulk gifting for employees or family? Enjoy extra discounts with code <strong className="text-muted-gold font-mono font-bold">DIWALI2026</strong> and pre-boxed presentation cartons.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/shop?category=combos"
                className="px-7 py-3.5 rounded-xl bg-muted-gold hover:bg-muted-gold-dark text-deep-green font-black text-xs uppercase tracking-wider shadow-lg shadow-muted-gold/20 active:scale-95 transition-all"
              >
                Explore Gift Combos
              </Link>
              <Link
                href="/about"
                className="px-6 py-3.5 rounded-xl bg-deep-green-dark hover:bg-deep-green text-cream font-bold text-xs border border-muted-gold/30 transition-all"
              >
                About Our Factory
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Shared Footer */}
      <Footer />

      {/* Slide-over Cart Drawer */}
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
