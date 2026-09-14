'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import {
  CheckCircle2,
  Sparkles,
  CreditCard,
  Smartphone,
  Headphones,
  ArrowRight
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-cream text-charcoal">
      <Navbar />

      <main className="flex-1">
        {/* Hero Header - Warm Beige */}
        <section className="bg-gradient-to-b from-card via-cream to-warm-beige/50 border-b border-warm-beige py-16 sm:py-20 text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-warm-beige border border-sage/50 text-deep-green text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-muted-gold" />
              <span>Welcome to Homely</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-charcoal tracking-tight">
              About Us
            </h1>

            <p className="text-lg sm:text-xl font-medium text-deep-green max-w-2xl mx-auto leading-relaxed">
              Everyday essentials, chosen for better living.
            </p>
          </div>
        </section>

        {/* Brand Mission & Philosophy */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
          <div className="bg-card rounded-3xl p-8 sm:p-10 border border-warm-beige shadow-sm space-y-6">
            <p className="text-lg sm:text-xl font-bold text-charcoal leading-relaxed">
              We believe shopping for your home should be simple, reliable, and worth your money.
            </p>

            <p className="text-base text-secondary-text leading-relaxed">
              We bring together carefully selected kitchen and household products that are useful for everyday life — from insulated casseroles and flasks to storage solutions and home essentials.
            </p>

            {/* Our Goal Callout */}
            <div className="p-6 rounded-2xl bg-warm-beige/60 border border-warm-beige space-y-2">
              <span className="text-xs font-black text-deep-green uppercase tracking-wider block">
                Our goal is simple:
              </span>
              <p className="text-xl sm:text-2xl font-black text-deep-green tracking-tight">
                Good products. Fair prices. Easy shopping.
              </p>
            </div>

            <p className="text-base text-secondary-text leading-relaxed">
              We work closely with trusted product suppliers and focus on giving customers a smooth online shopping experience, from product discovery to doorstep delivery.
            </p>
          </div>

          {/* Why Shop With Us? */}
          <div className="space-y-6 pt-6">
            <div className="text-center sm:text-left space-y-1">
              <span className="text-xs font-black uppercase tracking-wider text-deep-green">
                The Homely Promise
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-charcoal tracking-tight">
                Why Shop With Us?
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Feature 1 */}
              <div className="p-6 rounded-2xl bg-card border border-warm-beige shadow-sm space-y-3 hover:border-muted-gold transition-all">
                <div className="w-10 h-10 rounded-xl bg-warm-beige text-deep-green flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-deep-green" />
                </div>
                <h3 className="font-bold text-base text-charcoal">
                  ✓ Carefully Selected Products
                </h3>
                <p className="text-xs text-secondary-text leading-relaxed">
                  Products chosen for everyday use and value.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 rounded-2xl bg-card border border-warm-beige shadow-sm space-y-3 hover:border-muted-gold transition-all">
                <div className="w-10 h-10 rounded-xl bg-warm-beige text-deep-green flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-deep-green" />
                </div>
                <h3 className="font-bold text-base text-charcoal">
                  ✓ Honest Pricing
                </h3>
                <p className="text-xs text-secondary-text leading-relaxed">
                  Clear pricing with genuine offers.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 rounded-2xl bg-card border border-warm-beige shadow-sm space-y-3 hover:border-muted-gold transition-all">
                <div className="w-10 h-10 rounded-xl bg-warm-beige text-deep-green flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-deep-green" />
                </div>
                <h3 className="font-bold text-base text-charcoal">
                  ✓ Secure Payments
                </h3>
                <p className="text-xs text-secondary-text leading-relaxed">
                  Safe and reliable online payment options.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-6 rounded-2xl bg-card border border-warm-beige shadow-sm space-y-3 hover:border-muted-gold transition-all">
                <div className="w-10 h-10 rounded-xl bg-warm-beige text-deep-green flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-deep-green" />
                </div>
                <h3 className="font-bold text-base text-charcoal">
                  ✓ Easy Shopping
                </h3>
                <p className="text-xs text-secondary-text leading-relaxed">
                  Simple ordering experience from your phone or computer.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="p-6 rounded-2xl bg-card border border-warm-beige shadow-sm space-y-3 hover:border-muted-gold transition-all sm:col-span-2 lg:col-span-2">
                <div className="w-10 h-10 rounded-xl bg-warm-beige text-deep-green flex items-center justify-center">
                  <Headphones className="w-5 h-5 text-deep-green" />
                </div>
                <h3 className="font-bold text-base text-charcoal">
                  ✓ Customer Support
                </h3>
                <p className="text-xs text-secondary-text leading-relaxed">
                  We're here to help before and after your purchase.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Banner */}
          <div className="p-8 sm:p-10 rounded-3xl bg-deep-green text-cream border border-deep-green-light space-y-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-black text-cream">
                Ready to find everyday essentials?
              </h3>
              <p className="text-xs sm:text-sm text-sage">
                Explore our kitchenware, casseroles, combos & storage solutions.
              </p>
            </div>
            <Link
              href="/shop"
              className="px-6 py-3.5 rounded-xl bg-muted-gold hover:bg-muted-gold-dark text-deep-green font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 self-start sm:self-auto transition-all"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
