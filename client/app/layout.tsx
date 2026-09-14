import type { Metadata } from 'next';
import './globals.css';
import Script from 'next/script';
import { AuthProvider } from '../context/AuthContext';
import { AuthModal } from '../components/AuthModal';

export const metadata: Metadata = {
  title: 'Homely - Festive Offers 2026',
  description:
    'Official Festive Storefront for Homely Insulated Casseroles, Combos, Storage Containers, and Household Essentials.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
        />
      </head>
      <body className="min-h-screen bg-cream text-charcoal flex flex-col">
        <AuthProvider>
          {children}
          <AuthModal />
        </AuthProvider>
      </body>
    </html>
  );
}
