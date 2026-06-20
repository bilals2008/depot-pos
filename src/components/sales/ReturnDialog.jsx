// File: ogs-client/depot/src/components/sales/ReturnDialog.jsx
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle } from "lucide-react";

const ReturnDialog = ({ open, onOpenChange, order, onConfirm }) => {
  const [selectedItems, setSelectedItems] = useState([]);

  if (!order) return null;

  const toggleItem = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId) 
        : [...prev, itemId]
    );
  };

  const totalRefund = order.items
    .filter(item => selectedItems.includes(item.id))
    .reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleConfirm = () => {
    onConfirm(order.id, selectedItems);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125 bg-card border-none shadow-2xl text-foreground">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-foreground">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Process Return
          </DialogTitle>
          <p className="text-muted-foreground text-sm">
            Select items from Order <span className="text-primary font-mono font-bold">{order.id}</span> to return.
          </p>
        </DialogHeader>

        <div className="py-4">
          <ScrollArea className="h-75 pr-4">
            <div className="flex flex-col gap-3">
              {order.items.map((item) => (
                <div 
                  key={item.id} 
                  className={`flex items-start space-x-3 p-3 rounded-lg border border-border transition-colors ${
                    selectedItems.includes(item.id) ? "bg-primary/10 border-primary/50" : "bg-muted/30"
                  }`}
                >
                  <Checkbox 
                    id={`item-${item.id}`} 
                    checked={selectedItems.includes(item.id)}
                    onCheckedChange={() => toggleItem(item.id)}
                    className="border-primary/20 data-[state=checked]:bg-primary data-[state=checked]:text-white mt-1"
                  />
                  <div className="grid gap-1.5 leading-none w-full">
                    <Label 
                      htmlFor={`item-${item.id}`} 
                      className="text-sm font-medium leading-none text-foreground cursor-pointer"
                    >
                      {item.name}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity} • Price: Rs {item.price}
                    </p>
                  </div>
                  <div className="font-bold text-foreground">
                    Rs {item.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg mb-2 border border-border">
            <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Total Refund Amount</span>
            <span className="text-2xl font-black text-primary">Rs {totalRefund.toLocaleString()}</span>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-muted-foreground hover:bg-muted">
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={selectedItems.length === 0}
            className="bg-red-600 hover:bg-red-700 text-white border-none shadow-sm"
          >
            Confirm Return
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReturnDialog;
