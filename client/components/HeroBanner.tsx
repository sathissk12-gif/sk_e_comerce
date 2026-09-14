'use client';

import React from 'react';
import { Flame, Gift, Truck, Award } from 'lucide-react';

interface HeroBannerProps {
  onBrowse: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onBrowse }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl mx-4 sm:mx-6 lg:mx-8 mt-6 border border-amber-500/30 bg-gradient-to-r from-festive-navy via-festive-royal to-festive-navy shadow-2xl">
      {/* Festive Background Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 py-8 md:py-12 flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Left Content */}
        <div className="flex-1 text-center md:text-left space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold tracking-wide uppercase">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            Official 2026 Festival Collection
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight">
            Celebrate In Style with <br />
            <span className="gold-gradient-text">Festive Casseroles & Combos</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl font-normal leading-relaxed">
            Directly from the <strong className="text-amber-300">Asian Plastowares 2026 Festive Booklet</strong>.
            Hot insulated casseroles, airtight clear containers, and designer gift sets engineered to keep food warm and celebrations fresh.
          </p>

          {/* Quick Perks */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-200">
              <Award className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Double-Wall Insulated</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-200">
              <Gift className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Pre-Packed Gift Boxes</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-200">
              <Truck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Direct Godown Dispatch</span>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
            <button
              onClick={onBrowse}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 transition-all active:scale-95"
            >
              Shop Festive Catalog
            </button>
            <div className="px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-xs text-amber-200 font-medium">
              🏷️ Coupon: <span className="font-mono font-bold text-white bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">DIWALI2026</span> (10% Extra OFF)
            </div>
          </div>
        </div>

        {/* Right Product Spotlight Image */}
        <div className="relative w-72 sm:w-80 md:w-96 shrink-0 aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-amber-500/20 bg-slate-950/40 flex items-center justify-center p-2">
          {/* Booklet Hero Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/products/festive_hero_banner.png"
            alt="Asian Plastowares Festive Booklet Cover 2026"
            className="w-full h-full object-cover rounded-xl"
          />
          <div className="absolute bottom-3 left-3 right-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-amber-500/30 flex items-center justify-between text-xs">
            <span className="text-amber-300 font-bold">Grand Festive Booklet 2026</span>
            <span className="text-[11px] text-slate-300">Asian House, Mumbai</span>
          </div>
        </div>
      </div>
    </div>
  );
};
