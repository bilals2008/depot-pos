// File: ogs-client/depot/src/components/sales/ReceiptModal.jsx
import { useSettings } from "@/context/SettingsContext";
import { Printer } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";

const ReceiptModal = ({ open, onOpenChange, order }) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const { settings } = useSettings();

  if (!order) return null;

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
        if (window.electron && window.electron.printReceipt) {
            // Pass settings to the print function
            const result = await window.electron.printReceipt({ ...order, settings });
            if (result.success) {
                toast.success("Receipt sent to printer");
            }
        } else {
            // Fallback for browser testing
            window.print();
            toast.info("Browser print dialog opened");
        }
    } catch (error) {
        toast.error("Printer not found or error occurred");
        console.error(error);
    } finally {
        setIsPrinting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-100 p-0 bg-transparent border-none shadow-none flex flex-col items-center justify-center">
        {/* Receipt Container - Simulating 58mm Paper */}
        <div className="bg-white text-black w-75 p-4 text-xs font-mono shadow-2xl relative">
          {/* Tear-off effect (visual) */}
          <div className="absolute -bottom-1 left-0 right-0 h-2 bg-white" style={{ clipPath: "polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)" }}></div>

          <div className="text-center mb-4">
            <h2 className="font-bold text-lg uppercase">{settings.shopName || "Orion Orbit"}</h2> 
            <p className="text-[10px]">{settings.shopAddress || "Shop #12, Market Area"}</p>
            <p className="text-[10px]">{settings.shopPhone || "+92 300 1234567"}</p>
          </div>

          <div className="border-b-2 border-dashed border-black/20 my-2"></div>

          <div className="flex justify-between">
            <span>Date:</span>
            <span>{new Date(order.date).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Time:</span>
            <span>{new Date(order.date).toLocaleTimeString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Order #:</span>
            <span>{order.id}</span>
          </div>

          <div className="border-b-2 border-dashed border-black/20 my-2"></div>

          {/* Items Header */}
          <div className="grid grid-cols-12 gap-1 font-bold mb-1 border-b border-black pb-1">
             <div className="col-span-6">Item</div>
             <div className="col-span-2 text-right">Qty</div>
             <div className="col-span-4 text-right">Amt</div>
          </div>

          {/* Items */}
          <div className="flex flex-col gap-1 mb-2">
            {order.items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-1">
                <div className="col-span-6 truncate">{item.name}</div>
                <div className="col-span-2 text-right">{item.quantity}</div>
                <div className="col-span-4 text-right">
                    {(item.price * item.quantity).toFixed(0)}
                </div>
              </div>
            ))}
          </div>

          <div className="border-b-2 border-dashed border-black/20 my-2"></div>

          <div className="flex justify-between font-bold text-sm">
            <span>TOTAL</span>
            <span>{settings.currencySymbol || "PKR"} {order.total}</span>
          </div>
          <div className="flex justify-between text-[10px] mt-1">
            <span>Payment Method:</span>
            <span>{order.paymentMethod || 'Cash'}</span>
          </div>

          <div className="border-b-2 border-dashed border-black/20 my-4"></div>

          <div className="text-center text-[10px] mb-4">
            <p>*** THANK YOU ***</p>
            <p>Please come again!</p>
            <p className="mt-2 text-[8px] opacity-70">Software by Orion Orbit</p>
            <div className="mt-4 border-t border-black/10 pt-2">
                <p className="font-bold">Terms & Conditions</p>
                <p>Pencils and pens are not returnable after use.</p>
            </div>
          </div>
        </div>

        {/* Print Button outside receipt */}
        <div className="mt-4 flex gap-2">
            <Button 
                className="bg-white text-black hover:bg-white/90" 
                onClick={handlePrint}
                disabled={isPrinting}
            >
                <Printer className="h-4 w-4 mr-2" /> 
                {isPrinting ? "Printing..." : "Print"}
            </Button>
            <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={isPrinting}>
                Close
            </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
};

export default ReceiptModal;
