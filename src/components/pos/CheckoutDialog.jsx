// File: ogs-client/depot/src/components/pos/CheckoutDialog.jsx
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Banknote, CheckCircle, CreditCard, Printer } from "lucide-react";
import { useState } from "react";

const CheckoutDialog = ({ open, onOpenChange, cartItems, total, onComplete }) => {
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [isPaid, setIsPaid] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [showCashScreen, setShowCashScreen] = useState(false);
  const [cashReceived, setCashReceived] = useState("");

  const [receiptNumber] = useState(() => `OR-${Math.floor(100000 + Math.random() * 900000)}`);
  const [timestamp] = useState(() => new Date().toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  }));

  const handlePayment = (method) => {
    setPaymentMethod(method === "card" ? "digital" : method);
    if (method === "card") {
      setShowQr(true);
      return;
    }
    if (method === "cash") {
      setShowCashScreen(true);
      return;
    }
    // Simulate payment processing
    setTimeout(() => {
      setIsPaid(true);
    }, 500);
  };

  const confirmCashPayment = () => {
    setIsPaid(true);
    setShowCashScreen(false);
  };

  const confirmQrPayment = () => {
    setShowQr(false);
    setIsPaid(true);
  };

  const handleClose = () => {
    // Capture state before resetting
    const method = paymentMethod;
    const paid = isPaid;

    setPaymentMethod(null);
    setIsPaid(false);
    setShowQr(false);
    setShowCashScreen(false);
    setCashReceived("");
    onOpenChange(false);

    if (paid) {
      onComplete(method);
    }
  };

  const handlePrint = () => {
    window.print();
    // In a real electron app, we'd send to main process
    // For now, window.print() handles browser print which can be set to thermal
  };

  const grandTotal = total;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden bg-card border-none shadow-2xl">
        <div className="flex h-150">
          {/* Left Column: Persistent Receipt Preview */}
          <div className="w-75 bg-muted/30 border-r border-border flex flex-col p-6">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Receipt Preview</h3>
            <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700">
              <div className="flex items-start justify-center py-2">
                <div id="receipt-print-area" className="w-[58mm] bg-white text-black p-4 shadow-xl text-[11px] font-mono leading-tight animate-in fade-in zoom-in-95 duration-500">
                  <div className="flex justify-center mb-2">
                    <img src="/logo-white.png" alt="Logo" className="h-12 w-auto grayscale invert" />
                  </div>
                  <div className="text-center font-black text-base mb-0.5 tracking-tighter">ORION ORBIT</div>
                  <div className="text-center text-[9px] mb-2 text-zinc-500 font-sans">www.theorionschool.com</div>

                  <div className="flex justify-between text-[8px] mb-1 font-sans border-y border-zinc-100 py-1">
                    <span>ID: {receiptNumber}</span>
                    <span>{timestamp}</span>
                  </div>

                  <div className="text-center my-2 font-bold text-xs uppercase tracking-widest border-b border-black border-dashed pb-1">
                    Sale Receipt
                  </div>

                  <div className="flex flex-col gap-1 mb-2">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex flex-col border-b border-zinc-100 pb-1 mb-1">
                        <div className="font-bold uppercase text-[10px]">{item.name}</div>
                        <div className="flex justify-between text-[9px]">
                          <span className="text-zinc-600">#{item.barcode || item.id} x{item.quantity}</span>
                          <span className="font-bold">{item.price * item.quantity}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-0.5 mb-2">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span>Subtotal</span>
                      <span>Rs {grandTotal}</span>
                    </div>
                  </div>

                  <div className="border-t-2 border-black border-dashed my-1 pt-1.5">
                    <div className="flex justify-between font-black text-sm">
                      <span>TOTAL</span>
                      <span>Rs {grandTotal}</span>
                    </div>
                  </div>

                  <div className="text-center mt-3 text-[10px] font-bold uppercase tracking-wider">
                    Paid via {paymentMethod ? (paymentMethod === "cash" ? "Cash" : "Digital") : "---"}
                  </div>

                  {paymentMethod === "cash" && cashReceived && (
                    <div className="flex flex-col gap-0.5 mt-1 border-t border-black border-dotted pt-1 text-[9px]">
                      <div className="flex justify-between">
                        <span className="flex gap-1">Received <span className="text-urdu text-[8px]">(موصول)</span>:</span>
                        <span>{cashReceived}</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span className="flex gap-1">Change <span className="text-urdu text-[8px]">(بقیہ)</span>:</span>
                        <span>{Math.max(0, parseFloat(cashReceived || 0) - grandTotal)}</span>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "digital" && (
                    <div className="text-center text-[9px] mt-2 border border-black p-1.5 rounded-sm bg-zinc-50">
                      <div className="font-bold uppercase text-[8.5px]">Digital Transfer</div>
                    </div>
                  )}
                  <div className="text-center mt-4 text-[9px] font-sans text-zinc-400 italic">Thank you for choosing Orion Orbit</div>
                  <div className="text-center text-[5px] font-sans text-zinc-200 uppercase tracking-[0.2em] mt-1 opacity-50">System is powered by www.furba.org</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interaction Area */}
          <div className="flex-1 flex flex-col bg-card">
            <DialogHeader className="p-8 pb-0">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                {isPaid ? (
                  <><CheckCircle className="h-6 w-6 text-green-500" /> Payment Successful</>
                ) : showQr ? (
                  "Digital Payment"
                ) : showCashScreen ? (
                  <div className="flex items-center gap-2">
                    <span>Cash Payment</span>
                    <span className="text-urdu text-base opacity-70">نقد ادائیگی</span>
                  </div>
                ) : (
                  "Finalize Adayeigi"
                )}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {isPaid
                  ? "Order has been processed and receipt is ready."
                  : showQr
                    ? "Scan QR to complete transfer."
                    : showCashScreen
                      ? (
                        <div className="flex items-center gap-2">
                          <span>Enter amount received from customer.</span>
                          <span className="text-urdu text-sm opacity-70" dir="rtl">گاہک سے موصول شدہ رقم درج کریں۔</span>
                        </div>
                      )
                      : "Select a payment method to complete the sale."}
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto p-8">
              {isPaid ? (
                <div className="h-full flex flex-col justify-center items-center py-4 space-y-6">
                  <div className="text-center space-y-2">
                    <p className="text-4xl font-black text-primary">Rs. {grandTotal}</p>
                    <p className="text-muted-foreground font-medium uppercase tracking-widest text-sm">
                      Received via {paymentMethod === "cash" ? "Cash" : "Digital Transfer"}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 w-full max-sm-w gap-3">
                    <Button size="lg" className="h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handlePrint}>
                      <Printer className="mr-3 h-5 w-5" />
                      Print Thermal Receipt
                    </Button>
                    <Button variant="outline" size="lg" className="h-14 text-lg font-bold" onClick={handleClose}>
                      Close & New Sale
                    </Button>
                  </div>
                </div>
              ) : showQr ? (
                <div className="flex flex-col items-center space-y-4 animate-in slide-in-from-right duration-300">
                  <div className="bg-card p-3 rounded-2xl shadow-xl border border-border">
                    <div className="h-40 w-40 bg-foreground/10 rounded-lg flex items-center justify-center text-foreground text-xs overflow-hidden">
                      <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=03001234567" alt="QR Code" className="w-full h-full grayscale invert dark:invert-0" />
                    </div>
                  </div>
                  <div className="text-center space-y-1">
                    <p className="font-bold text-lg text-foreground leading-none">Easypaisa / JazzCash / Raast</p>
                    <p className="font-mono text-xl font-black text-primary tracking-wider">0300-1234567</p>
                    <p className="text-urdu text-xl font-normal mt-2 text-muted-foreground leading-normal" dir="rtl">
                      اپنی ایپ سے سکین کرکے پیمنٹ کریں
                    </p>
                  </div>
                  <div className="flex gap-3 w-full max-w-sm pt-2">
                    <Button variant="ghost" className="flex-1 h-10 text-muted-foreground text-xs" onClick={() => setShowQr(false)}>Back</Button>
                    <Button className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs" onClick={confirmQrPayment}>
                      Confirm Payment
                    </Button>
                  </div>
                </div>
              ) : showCashScreen ? (
                <div className="space-y-6 animate-in slide-in-from-right duration-300">
                  <div className="bg-muted/30 rounded-2xl p-6 border border-border space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-sm">Total Payable</span>
                        <span className="text-urdu text-xs opacity-60">کل واجب الادا</span>
                      </div>
                      <span className="text-xl font-bold">Rs. {grandTotal}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-end">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cash Received</label>
                        <span className="text-urdu text-xs opacity-60">موصول شدہ نقد</span>
                      </div>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-lg">Rs.</span>
                        <input
                          type="number"
                          value={cashReceived}
                          onChange={(e) => setCashReceived(e.target.value)}
                          className="w-full h-14 pl-12 pr-4 rounded-xl bg-card border-2 border-border focus:border-primary outline-none text-2xl font-black"
                          placeholder="0.00"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <div className="flex flex-col">
                        <span className="text-lg font-bold">Change to Return</span>
                        <span className="text-urdu text-sm opacity-60">بقیہ واپسی</span>
                      </div>
                      <span className="text-2xl font-black text-green-600 dark:text-green-400">
                        Rs. {Math.max(0, parseFloat(cashReceived || 0) - grandTotal)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3 w-full pt-2">
                    <Button variant="ghost" size="lg" className="flex-1 h-12 text-muted-foreground" onClick={() => setShowCashScreen(false)}>Back</Button>
                    <Button
                      size="lg"
                      className="flex-1 h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20"
                      onClick={confirmCashPayment}
                      disabled={!cashReceived || parseFloat(cashReceived) < grandTotal}
                    >
                      Process Payment (نقد)
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-8 animate-in slide-in-from-left duration-300">
                  {/* Totals Summary */}
                  <div className="bg-muted/30 rounded-2xl p-6 border border-border space-y-4">
                    <div className="flex justify-between items-baseline">
                      <span className="text-lg font-bold">Total Amount</span>
                      <span className="text-3xl font-black text-primary">Rs. {grandTotal}</span>
                    </div>
                  </div>

                  {/* Payment Choices */}
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handlePayment("cash")}
                      className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-border bg-card hover:border-primary hover:bg-primary/5 transition-all group"
                    >
                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                        <Banknote className="h-8 w-8 text-primary transition-colors" />
                      </div>
                      <span className="font-bold text-lg">Cash</span>
                      <span className="text-urdu text-xl text-muted-foreground mt-1">نقد</span>
                    </button>
                    <button
                      onClick={() => handlePayment("card")}
                      className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-border bg-card hover:border-primary hover:bg-primary/5 transition-all group"
                    >
                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                        <CreditCard className="h-8 w-8 text-primary transition-colors" />
                      </div>
                      <span className="font-bold text-lg">Digital</span>
                      <span className="text-urdu text-xl text-muted-foreground mt-1">ڈیجیٹل</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 flex justify-center border-t border-zinc-100 dark:border-zinc-900">
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                built by <span className="text-primary font-bold">www.furba.org</span>
              </p>
            </div>
          </div>
        </div>

        <style>{`
          @media print {
            @page { size: 58mm auto; margin: 0; }
            body * { visibility: hidden; }
            #receipt-print-area, #receipt-print-area * { visibility: visible; }
            #receipt-print-area { 
                position: absolute; 
                left: 0; 
                top: 0; 
                width: 58mm; 
                margin: 0; 
                padding: 8px; 
                box-shadow: none; 
                border: none; 
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutDialog;
