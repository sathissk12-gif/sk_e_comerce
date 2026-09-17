'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShoppingBag,
  ShieldCheck,
  Sparkles,
  Radio,
  Menu,
  X,
  User,
  Search,
  LayoutGrid,
  Info,
  LogIn,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isAuthorizedAdmin } from '../lib/auth-constants';

interface NavbarProps {
  cartCount?: number;
  cartTotal?: number;
  onOpenCart?: () => void;
  isWsConnected?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount = 0,
  cartTotal = 0,
  onOpenCart,
  isWsConnected = false
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, openAuthModal } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navSearch, setNavSearch] = useState('');
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setCurrentCategory(params.get('category'));
    }
  }, [pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (navSearch.trim()) {
      router.push(`/shop?search=${encodeURIComponent(navSearch.trim())}`);
    } else {
      router.push('/shop');
    }
  };

  const categoryPills = [
    { id: 'all', label: 'All Products', href: '/shop', hasIcon: true },
    { id: 'casseroles', label: 'Casseroles', href: '/shop?category=casseroles' },
    { id: 'combos', label: 'Combos & Sets', href: '/shop?category=combos' },
    { id: 'tiffins', label: 'Tiffins', href: '/shop?category=tiffins' },
    { id: 'bottles', label: 'Bottles & Jugs', href: '/shop?category=bottles' },
    { id: 'coolers', label: 'Ice Coolers', href: '/shop?category=coolers' },
    { id: 'containers', label: 'Containers', href: '/shop?category=containers' },
    { id: 'organizers', label: 'Organizers', href: '/shop?category=organizers' },
    { id: 'household', label: 'Household', href: '/shop?category=household' },
  ];

  const isCategoryActive = (catId: string, href: string) => {
    if (pathname !== '/shop') return false;
    if (catId === 'all') return !currentCategory || currentCategory === 'all';
    return currentCategory === catId;
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-cream/95 backdrop-blur-md border-b border-warm-beige shadow-sm">
      {/* Top Deep Green Announcement Ribbon */}
      <div className="bg-deep-green text-cream font-medium text-xs sm:text-sm py-1.5 px-4 text-center tracking-wide flex items-center justify-center gap-2 shadow-inner">
        <Sparkles className="w-3.5 h-3.5 text-muted-gold" />
        <span>
          🪔 ONAM & DIWALI FESTIVE OFFERS — FLAT 32% OFF! USE CODE:{' '}
          <strong className="bg-muted-gold text-deep-green px-2 py-0.5 rounded font-mono font-black tracking-wider ml-1">
            DIWALI2026
          </strong>{' '}
          FOR EXTRA 10% OFF
        </span>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Exact Brand Logo as cropped from reference */}
        <Link href="/" className="flex items-center shrink-0 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/homely_logo.png"
            alt="HOMELY - Everyday Living, Better"
            className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-[1.02]"
          />
        </Link>

        {/* Search Bar Pill (Exact reference style) */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative flex-1 max-w-xs sm:max-w-sm lg:max-w-md hidden md:block"
        >
          <input
            type="text"
            value={navSearch}
            onChange={e => setNavSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-card hover:bg-card focus:bg-card border border-warm-beige rounded-full py-2 pl-10 pr-4 text-xs text-charcoal placeholder:text-secondary-text focus:outline-none focus:border-deep-green shadow-sm transition-all"
          />
          <Search className="w-4 h-4 text-secondary-text absolute left-3.5 top-1/2 -translate-y-1/2" />
        </form>

        {/* Right Nav Links & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-bold text-secondary-text">
            <Link
              href="/about"
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                pathname === '/about' ? 'text-deep-green font-black bg-warm-beige/80' : 'hover:text-charcoal hover:bg-warm-beige/40'
              }`}
            >
              <Info className="w-3.5 h-3.5 text-deep-green" />
              <span>About Us</span>
            </Link>

            {/* Auth State Button / Dropdown */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-card hover:bg-warm-beige/60 border border-warm-beige text-xs font-bold text-charcoal shadow-sm transition-all">
                  {user.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatarUrl} alt={user.name} className="w-5 h-5 rounded-full object-cover border border-sage/60" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-deep-green text-muted-gold text-[10px] font-black flex items-center justify-center">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="max-w-[90px] truncate">{user.name.split(' ')[0]}</span>
                  <ChevronDown className="w-3 h-3 text-secondary-text group-hover:rotate-180 transition-transform" />
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-1 w-48 bg-card border border-warm-beige rounded-2xl shadow-xl py-1.5 hidden group-hover:block hover:block z-50 animate-scale-up">
                  <div className="px-3.5 py-2 border-b border-warm-beige/60">
                    <div className="text-xs font-bold text-charcoal truncate">{user.name}</div>
                    <div className="text-[10px] text-secondary-text truncate">{user.email}</div>
                  </div>
                  <Link
                    href="/account"
                    className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-charcoal hover:bg-warm-beige/50"
                  >
                    <User className="w-3.5 h-3.5 text-deep-green" />
                    <span>My Account & Orders</span>
                  </Link>
                  {user && isAuthorizedAdmin(user.email) && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-deep-green hover:bg-warm-beige/50"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-muted-gold" />
                      <span>Admin Portal</span>
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 text-left border-t border-warm-beige/60"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-600" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-card hover:bg-warm-beige text-deep-green border border-warm-beige shadow-sm transition-all active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5 text-deep-green" />
                <span>Sign In</span>
              </button>
            )}
          </nav>

          {/* WebSocket Status Indicator */}
          <div
            title={isWsConnected ? 'Connected to Real-time API' : 'Syncing...'}
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card border border-warm-beige text-[11px] text-secondary-text"
          >
            <Radio className={`w-3 h-3 ${isWsConnected ? 'text-deep-green animate-pulse' : 'text-muted-gold'}`} />
            <span className="font-semibold">{isWsConnected ? 'Live' : 'Sync'}</span>
          </div>

          {/* Admin Portal Button - Only visible to authorized administrators */}
          {user && isAuthorizedAdmin(user.email) && (
            <Link
              href="/admin"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 border ${
                pathname === '/admin'
                  ? 'bg-deep-green text-muted-gold border-muted-gold shadow-md'
                  : 'bg-card hover:bg-warm-beige text-deep-green border-warm-beige shadow-sm'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-muted-gold" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}

          {/* Cart Button */}
          {onOpenCart && (
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-4 py-2 rounded-xl bg-deep-green hover:bg-deep-green-hover text-cream font-bold text-xs sm:text-sm shadow-md shadow-deep-green/25 transition-all active:scale-95 border border-deep-green-light"
            >
              <ShoppingBag className="w-4 h-4 text-muted-gold" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="bg-muted-gold text-deep-green text-xs px-1.5 py-0.2 rounded-full font-black animate-bounce-short">
                  {cartCount}
                </span>
              )}
              {cartTotal > 0 && (
                <span className="text-xs font-black border-l border-sage/40 pl-2 text-muted-gold">
                  ₹{cartTotal}
                </span>
              )}
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-charcoal hover:bg-warm-beige/60"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sub-Navbar: Horizontal Category Pills (Exact screenshot style) */}
      <div className="border-t border-warm-beige/60 bg-cream/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 overflow-x-auto flex items-center gap-2 no-scrollbar">
          {categoryPills.map(cat => {
            const active = isCategoryActive(cat.id, cat.href);
            return (
              <Link
                key={cat.id}
                href={cat.href}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                  active
                    ? 'bg-warm-beige text-deep-green border border-sage/60 shadow-sm font-black'
                    : 'text-secondary-text hover:text-charcoal hover:bg-warm-beige/40'
                }`}
              >
                {cat.hasIcon && <LayoutGrid className="w-3.5 h-3.5 text-deep-green" />}
                <span>{cat.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-warm-beige bg-card px-4 py-3 space-y-2 shadow-lg">
          {/* Mobile Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative pb-2">
            <input
              type="text"
              value={navSearch}
              onChange={e => setNavSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-cream border border-warm-beige rounded-full py-2 pl-9 pr-4 text-xs text-charcoal focus:outline-none focus:border-deep-green"
            />
            <Search className="w-4 h-4 text-secondary-text absolute left-3 top-2.5" />
          </form>

          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-secondary-text hover:bg-cream"
          >
            <span>Home</span>
          </Link>
          <Link
            href="/shop"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-secondary-text hover:bg-cream"
          >
            <span>Shop Catalog</span>
          </Link>
          <Link
            href="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-secondary-text hover:bg-cream"
          >
            <span>About Us</span>
          </Link>
          <Link
            href="/account"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-secondary-text hover:bg-cream"
          >
            <span>My Account & Orders</span>
          </Link>
          
          {user ? (
            <div className="pt-2 border-t border-warm-beige">
              <div className="px-3 py-1 text-xs font-bold text-charcoal flex items-center justify-between">
                <span>Signed in as {user.name}</span>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-red-600 font-bold"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-2 border-t border-warm-beige">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal('login');
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-deep-green text-cream"
              >
                <LogIn className="w-3.5 h-3.5 text-muted-gold" />
                <span>Sign In / Register</span>
              </button>
            </div>
          )}

          {user && isAuthorizedAdmin(user.email) && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-deep-green text-muted-gold"
            >
              <ShieldCheck className="w-4 h-4 text-muted-gold" />
              <span>Admin Portal</span>
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
