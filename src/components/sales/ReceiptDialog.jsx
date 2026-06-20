// File: ogs-client/depot/src/components/sales/ReceiptDialog.jsx
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

const ReceiptDialog = ({ open, onOpenChange, sale }) => {
  if (!sale) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-PK", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-95 p-0 overflow-hidden bg-white text-black">
        {/* Hidden accessible title */}
        <DialogHeader className="sr-only">
          <DialogTitle>Receipt {sale.id}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center p-6 font-mono text-xs uppercase leading-tight bg-white">
          {/* Header */}
          <div className="text-center mb-4">
            <h2 className="text-lg font-bold">Stationery Hub</h2>
            <p>123 Main Street, Lahore</p>
            <p>Tel: 0300-1234567</p>
          </div>

          <Separator className="bg-black mb-2" />

          {/* Meta Data */}
          <div className="w-full flex justify-between mb-1">
            <span>Date: {formatDate(sale.date)}</span>
          </div>
          <div className="w-full flex justify-between mb-4">
            <span>Order #: {sale.id.replace('ORD-', '')}</span>
            <span>{sale.paymentMethod || 'Cash'}</span>
          </div>

          <Separator className="bg-dashed border-t border-black mb-2 h-0" />

          {/* Items */}
          <div className="w-full space-y-1 mb-2">
            <div className="flex font-bold border-b border-black pb-1 mb-1">
              <span className="w-8">Qty</span>
              <span className="flex-1">Item</span>
              <span className="text-right w-16">Price</span>
            </div>
            {sale.items.map((item, i) => (
              <div key={i} className="flex">
                <span className="w-8">{item.quantity}</span>
                <span className="flex-1 truncate pr-2">{item.name}</span>
                <span className="text-right w-16">
                  {formatCurrency(item.price * item.quantity).replace('PKR', '')}
                </span>
              </div>
            ))}
          </div>

          <Separator className="bg-dashed border-t border-black mt-2 mb-2 h-0" />

          {/* Totals */}
          <div className="w-full space-y-1 text-sm font-bold">
            <div className="flex justify-between">
              <span>Total Qty:</span>
              <span>{sale.items.reduce((a, b) => a + b.quantity, 0)}</span>
            </div>
            <div className="flex justify-between text-base">
              <span>Total:</span>
              <span>{formatCurrency(sale.total)}</span>
            </div>
          </div>

          <Separator className="bg-black mt-4 mb-4" />

          {/* Footer */}
          <div className="text-center space-y-1">
            <p>*** Thank You ***</p>
            <p>Please come again!</p>
            <p className="mt-4 text-[10px]">Powered by OGS POS</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptDialog;
