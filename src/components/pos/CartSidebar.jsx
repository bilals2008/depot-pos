// File: ogs-client/depot/src/components/pos/CartSidebar.jsx
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, CreditCard, ShoppingCart } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const CartSidebar = ({ cartItems, updateQuantity, removeFromCart, total, onCheckout }) => {
  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="p-5 border-b bg-card shadow-sm z-10">
        <div className="flex items-center gap-3 mb-1">
          <div className="bg-primary/10 p-2.5 rounded-xl">
            <ShoppingCart className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Current Sale</h2>
            <p className="text-xs text-muted-foreground">
              Order #{String(Date.now()).slice(-4)} • {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Cart Items */}
      <ScrollArea className="flex-1 p-0">
        <div className="p-4 space-y-2">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[40vh] text-muted-foreground gap-3">
              <ShoppingCart className="h-14 w-14 opacity-20" />
              <p className="text-sm">No items in cart</p>
              <p className="text-xs">Click products or scan barcode to add</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl hover:bg-muted/70 transition-colors group"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-12 w-12 rounded-lg object-cover bg-background border"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{item.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    Rs. {item.price} × {item.quantity}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="font-bold text-sm">Rs. {item.price * item.quantity}</span>
                  <div className="flex items-center gap-0.5 bg-background rounded-lg border shadow-sm">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1.5 hover:bg-muted rounded-l-lg h-7 w-7 flex items-center justify-center transition-colors"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-xs font-semibold w-5 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1.5 hover:bg-muted rounded-r-lg h-7 w-7 flex items-center justify-center transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-1.5 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer with Totals */}
      <div className="p-5 bg-card border-t shadow-[0_-4px_16px_-4px_rgba(0,0,0,0.08)] z-20">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Items</span>
            <span>{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>Rs. {total}</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between items-baseline">
            <span className="font-bold">Total</span>
            <span className="font-bold text-2xl text-primary">Rs. {total}</span>
          </div>
        </div>
        <Button
          className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20"
          size="lg"
          disabled={cartItems.length === 0}
          onClick={onCheckout}
        >
          <CreditCard className="mr-2 h-5 w-5" />
          Checkout
        </Button>
      </div>
    </div>
  );
};

export default CartSidebar;
