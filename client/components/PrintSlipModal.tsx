'use client';

import React from 'react';
import { X, Printer } from 'lucide-react';

interface PrintSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any | null;
}

export const PrintSlipModal: React.FC<PrintSlipModalProps> = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-charcoal/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-card text-charcoal rounded-2xl shadow-2xl overflow-hidden print:shadow-none print:m-0 print:w-full print:max-w-none border border-warm-beige">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="p-4 bg-deep-green text-cream flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-muted-gold" />
            <span className="font-bold text-sm">Godown Packing Slip & Waybill</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-lg bg-muted-gold hover:bg-muted-gold-dark text-deep-green font-black text-xs flex items-center gap-1.5 shadow"
            >
              <Printer className="w-4 h-4" />
              <span>Print Slip</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-sage hover:text-cream hover:bg-deep-green-light transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Packing Slip Body */}
        <div className="p-8 space-y-6 text-xs leading-relaxed print:p-4 bg-card">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-deep-green pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-deep-green flex items-center justify-center text-muted-gold font-black text-sm">
                  H
                </div>
                <span className="text-2xl font-black tracking-tight text-deep-green">HOMELY</span>
                <span className="text-xs bg-deep-green text-muted-gold px-2 py-0.5 rounded font-bold">STORE</span>
              </div>
              <p className="font-bold text-charcoal text-[11px] mt-1">HOMELY LIFESTYLE & PLASTOWARES</p>
              <p className="text-secondary-text text-[10px] max-w-xs">
                Plot No. D-7/1, Road No. 16, M.I.D.C., Andheri (E), Mumbai - 400 093.
              </p>
              <p className="text-secondary-text text-[10px]">GSTIN: 27AAACA9082M1Z5</p>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded bg-cream border border-warm-beige font-mono font-black text-sm text-deep-green">
                {order.orderNumber}
              </span>
              <p className="text-[10px] text-secondary-text mt-1">
                Date: {new Date(order.createdAt).toLocaleDateString('en-IN')}
              </p>
              <p className="text-[10px] font-bold text-deep-green uppercase">
                Payment: {order.paymentMode} ({order.paymentStatus})
              </p>
            </div>
          </div>

          {/* Customer & Destination Box */}
          <div className="grid grid-cols-2 gap-4 bg-cream p-4 rounded-xl border border-warm-beige">
            <div>
              <span className="text-[10px] font-black uppercase text-secondary-text tracking-wider block mb-1">
                Deliver To (Customer):
              </span>
              <p className="font-bold text-sm text-charcoal">{order.customerName}</p>
              <p className="text-secondary-text">{order.shippingAddress.street}</p>
              <p className="text-secondary-text font-medium">
                {order.shippingAddress.city}, {order.shippingAddress.state} - <strong>{order.shippingAddress.pincode}</strong>
              </p>
              <p className="text-secondary-text font-mono text-[11px] mt-1">📞 {order.customerPhone}</p>
            </div>

            <div className="border-l border-warm-beige pl-4 space-y-1">
              <span className="text-[10px] font-black uppercase text-secondary-text tracking-wider block mb-1">
                Warehouse Allocation:
              </span>
              <p className="text-secondary-text">
                Packed By: <strong>{order.godownDetails?.packedBy || 'Godown Warehouse Team'}</strong>
              </p>
              <p className="text-secondary-text">
                Courier: <strong>{order.dispatchDetails?.courierPartner || 'Assigned at Dispatch'}</strong>
              </p>
              {order.dispatchDetails?.trackingNumber && (
                <p className="text-secondary-text font-mono">
                  AWB: <strong>{order.dispatchDetails.trackingNumber}</strong>
                </p>
              )}
            </div>
          </div>

          {/* Items Table with Rack Bin */}
          <div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-warm-beige text-[10px] font-black uppercase text-secondary-text">
                  <th className="py-2">Item & Description</th>
                  <th className="py-2">Color / Size</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Offer Price</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-beige">
                {order.items.map((it: any, i: number) => (
                  <tr key={i}>
                    <td className="py-2.5 font-bold text-charcoal">
                      {it.productName}
                      <span className="block text-[10px] font-normal text-secondary-text font-mono">
                        SKU: {it.sku}
                      </span>
                    </td>
                    <td className="py-2.5 text-secondary-text">
                      <span className="font-semibold text-charcoal">{it.color}</span>
                      {it.capacity && <span className="block text-[10px] text-secondary-text">{it.capacity}</span>}
                    </td>
                    <td className="py-2.5 text-center font-bold text-charcoal">{it.quantity}</td>
                    <td className="py-2.5 text-right font-mono">₹{it.offerPrice}</td>
                    <td className="py-2.5 text-right font-mono font-bold text-deep-green">
                      ₹{it.totalPrice}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary / Totals */}
          <div className="border-t-2 border-deep-green pt-3 flex justify-between items-start">
            <div className="text-[10px] text-secondary-text space-y-1">
              <p>✓ Inspected by Homely Godown Q/C Team.</p>
              <p>✓ Sealed in Gift Packaging with Carry Handle.</p>
            </div>

            <div className="w-56 space-y-1 text-right">
              <div className="flex justify-between text-secondary-text">
                <span>Subtotal MRP:</span>
                <span className="line-through">₹{order.subtotalMrp}</span>
              </div>
              <div className="flex justify-between text-deep-green font-bold">
                <span>Total Savings:</span>
                <span>- ₹{order.savingsTotal}</span>
              </div>
              {order.couponDiscount > 0 && (
                <div className="flex justify-between text-muted-gold-dark font-bold">
                  <span>Coupon ({order.couponCode}):</span>
                  <span>- ₹{order.couponDiscount}</span>
                </div>
              )}
              <div className="flex justify-between text-charcoal font-black text-sm pt-2 border-t border-warm-beige">
                <span>Grand Total:</span>
                <span className="text-deep-green">₹{order.finalPayable}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
