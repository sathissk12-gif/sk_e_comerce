# Homely - Festive E-Commerce Platform

A full-stack, real-time festive e-commerce application built with Next.js, NestJS, and WebSockets.

## 🎨 Theme & Design System
- **Main Background:** Cream `#FAF8F2`
- **Cards & Surfaces:** White `#FFFFFF`
- **Primary / Buttons:** Deep Green `#173B32`
- **Secondary Green:** Sage `#A8B9A5`
- **Light Sections & Borders:** Warm Beige `#F3EBDD`
- **Accents:** Muted Gold `#C8A96B`
- **Main Text:** Dark Charcoal `#17201D`
- **Secondary Text:** Muted Slate `#68736E`

---

## 🚀 Architecture

```
Customer
   ↓
Website (Next.js 14)
   ↓
API (NestJS + WebSockets)
   ↓
Products / Orders / Coupons / Payments (Razorpay)
   ↓
Admin Portal
   ↓
Godown & Warehouse
   ↓
Dispatch Logistics & Tracking
```

### Multi-Page Storefront
- **Home (`/`):** Hero showcase with brand tagline *"Everyday Living, Better"*, quick category shortcuts, trust credentials, and bestsellers preview.
- **Shop (`/shop`):** Comprehensive catalog with category pills (`All Products`, `Casseroles`, `Combos`, `Containers`, `Household`), price filters, instant search, and stock status.
- **About Us (`/about`):** Everyday essentials brand philosophy, simple goal callout, and 5 "Why Shop With Us?" pillars.
- **My Account (`/account`):** Customer profile, live milestone order tracker, and printable PDF pick slips & tax invoices.
- **Admin Portal (`/admin`):**
  - **Product Management:** Add/edit/delete products, inventory stock quick-adjust ($+/-$).
  - **Orders Pipeline:** Status workflow (Pending $\rightarrow$ Godown Packing $\rightarrow$ Courier Dispatch with AWB $\rightarrow$ Delivered).
  - **Coupons Engine:** Create & manage promotional codes.
  - **Real-Time Order Chime:** Web Audio API live chime and push alert on order placement.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### 1. Start the NestJS Backend API
```bash
cd server
npm install
npm start
```
The API server runs on `http://localhost:4000`.

### 2. Start the Next.js Frontend Client
```bash
cd client
npm install
npm run build
npm start
# or for development: npm run dev
```
The storefront runs on `http://localhost:3000`.
