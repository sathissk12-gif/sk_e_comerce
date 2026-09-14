'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Phone, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-deep-green text-sage text-xs py-12 border-t border-deep-green-light mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-deep-green-light">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-muted-gold flex items-center justify-center font-black text-deep-green text-sm">
                H
              </div>
              <div>
                <span className="font-black text-cream text-lg tracking-tight block">HOMELY</span>
                <span className="text-[10px] text-muted-gold font-semibold uppercase tracking-wider block">Everyday Living, Better</span>
              </div>
            </div>
            <p className="text-sage text-xs leading-relaxed">
              Premium insulated casseroles, festive combos, and storage solutions engineered for modern homes & celebration gifting.
            </p>
            <div className="flex items-center gap-1 text-[11px] text-muted-gold font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Official Festive Catalog 2026</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="text-cream font-bold text-xs uppercase tracking-wider">Store Navigation</h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/" className="hover:text-cream transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-cream transition-colors">Shop Catalog</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-cream transition-colors">About Us</Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-cream transition-colors">My Account & Orders</Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-cream text-muted-gold font-semibold transition-colors">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <h4 className="text-cream font-bold text-xs uppercase tracking-wider">Top Categories</h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/shop?category=casseroles" className="hover:text-cream transition-colors">
                  Insulated Casseroles
                </Link>
              </li>
              <li>
                <Link href="/shop?category=combos" className="hover:text-cream transition-colors">
                  Festive Gift Combos & Flasks
                </Link>
              </li>
              <li>
                <Link href="/shop?category=containers" className="hover:text-cream transition-colors">
                  Airtight Storage Sets
                </Link>
              </li>
              <li>
                <Link href="/shop?category=household" className="hover:text-cream transition-colors">
                  Household Stools & Buckets
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-2.5">
            <h4 className="text-cream font-bold text-xs uppercase tracking-wider">Factory & Customer Care</h4>
            <div className="flex items-start gap-2 text-[11px]">
              <MapPin className="w-4 h-4 text-muted-gold shrink-0 mt-0.5" />
              <span>Plot No. D-7/1, Road No. 16, M.I.D.C., Andheri (E), Mumbai - 400 093.</span>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <Phone className="w-3.5 h-3.5 text-muted-gold shrink-0" />
              <span>Ph. No.: 66960033 / 66952426</span>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <Mail className="w-3.5 h-3.5 text-muted-gold shrink-0" />
              <span>support@homely.in</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p className="text-sage/80">
            © 2026 Homely Lifestyle & Plastowares. All rights reserved. GSTIN: 27AAACA9082M1Z5.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-sage/80">Double-Wall Insulated • 100% Virgin Food-Grade</span>
            <Link
              href="/admin"
              className="px-3 py-1 rounded bg-deep-green-dark hover:bg-deep-green text-muted-gold font-bold border border-muted-gold/40 transition-colors"
            >
              Operations Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
