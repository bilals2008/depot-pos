// File: ogs-client/depot/src/components/pos/QuickSellSheet.jsx
import { useState, useMemo, useRef, useEffect } from "react";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Printer,
  ShoppingBag,
  Package,
  X,
  ScanBarcode,
  Check,
  TrendingUp
} from "lucide-react";
import { products } from "@/lib/data";
import { cn } from "@/lib/utils";

const QuickSellSheet = ({ open, onOpenChange, onComplete }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [addedFeedback, setAddedFeedback] = useState({}); // { [id]: boolean }
  const searchInputRef = useRef(null);

  // Focus search when opened
  useEffect(() => {
    if (open) {
      // Small delay to ensure sheet animation doesn't steal focus
      const timer = setTimeout(() => searchInputRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Filter products based on search
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) {
      // Return Top 5 stats-wise (mock: just first 5 for now)
      return products.slice(0, 5).map(p => ({ ...p, isTopPick: true }));
    }
    const query = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.barcode.includes(query)
    ).slice(0, 5); // Limit to 5 results
  }, [searchQuery]);

  // Calculate total
  const total = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Add item to cart
  const addToCart = (productToAdd = selectedProduct, qty = quantity) => {
    if (!productToAdd) return;

    // Show visual feedback
    setAddedFeedback(prev => ({ ...prev, [productToAdd.id]: true }));
    setTimeout(() => {
      setAddedFeedback(prev => ({ ...prev, [productToAdd.id]: false }));
    }, 1000);

    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === productToAdd.id);
      if (existing) {
        return prev.map((item) =>
          item.id === productToAdd.id
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [...prev, { ...productToAdd, quantity: qty }];
    });

    // Reset basics but keep flow smooth
    if (productToAdd === selectedProduct) {
        setSelectedProduct(null);
        setSearchQuery("");
        setQuantity(1);
        searchInputRef.current?.focus();
    }
  };

  // Update quantity in cart
  const updateCartQuantity = (id, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Remove item from cart
  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Handle checkout
  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    onComplete?.(cartItems, total);
    setCartItems([]);
    setSearchQuery("");
    setSelectedProduct(null);
    setQuantity(1);
    onOpenChange(false);
  };

  const selectProduct = (product) => {
      // Determine if we should add immediately or select for quantity
      // User says: "Click them... to add". Let's simply add 1 immediately for speed,
      // or select it. The prompt says "Item Cards... Add button".
      // So clicking the row checks it? Or clicking Add adds it?
      // Let's make the row selectable to adjust quantity, and Add button adds immediately.
      setSelectedProduct(product);
      setSearchQuery(product.name);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="left" 
        className="w-full sm:w-[500px] sm:max-w-[500px] flex flex-col p-0 gap-0 border-r border-border/40"
      >
        {/* Header - Compact */}
        <div className="flex items-center justify-between p-4 border-b bg-muted/10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
               <ShoppingBag className="h-4 w-4" />
            </div>
            <div>
               <h2 className="text-lg font-semibold leading-none">New Sale</h2>
               <p className="text-xs text-muted-foreground mt-0.5">Transaction #1024</p>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Input Section - Dense & Combined */}
          <div className="p-3 grid gap-2 bg-card z-10 shadow-sm shrink-0">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {selectedProduct ? <Package className="h-4 w-4" /> : <Search className="h-4 w-4" />}
                </div>
                <Input
                  ref={searchInputRef}
                  placeholder="Scan barcode or search..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if(!e.target.value) setSelectedProduct(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        if(selectedProduct) {
                            addToCart();
                        } else if (filteredProducts.length > 0) {
                            // If user hits enter with results, select/add first one? 
                            // Standard POS: Enter adds if unique match. 
                            // For simplicity, let's select first if pure search.
                             addToCart(filteredProducts[0], quantity);
                        }
                    }
                  }}
                  className={cn(
                    "h-10 pl-9 pr-8 transition-all",
                    selectedProduct && "border-primary bg-primary/5 font-medium"
                  )}
                />
                {!searchQuery && (
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none">
                    <ScanBarcode className="h-4 w-4" />
                  </div>
                )}
                {searchQuery && (
                   <button 
                     onClick={() => {
                        setSearchQuery('');
                        setSelectedProduct(null);
                        setQuantity(1);
                        searchInputRef.current?.focus();
                     }}
                     className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                   >
                     <X className="h-3 w-3" />
                   </button>
                )}
              </div>

              {/* Quantity & Add - Compact */}
              <div className="flex items-center gap-1 border rounded-md h-10 px-1 shrink-0 bg-card">
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-sm" onClick={() => setQuantity(q => Math.max(1, q-1))}>
                   <Minus className="h-3 w-3" />
                </Button>
                <Input 
                   type="number" 
                   value={quantity} 
                   onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                   className="w-10 h-7 text-center border-0 p-0 focus-visible:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-sm" onClick={() => setQuantity(q => q+1)}>
                   <Plus className="h-3 w-3" />
                </Button>
              </div>

              <Button 
                onClick={() => addToCart()} 
                className="h-10 px-4 shadow-sm"
                disabled={!selectedProduct}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </div>
          
          {/* Quick Picks / Search Results - Visible below search */}
          <div className="bg-muted/30 border-b shrink-0">
             <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                {!searchQuery ? (
                    <><TrendingUp className="h-3 w-3" /> Top Selling Items</>
                ) : (
                    <><Search className="h-3 w-3" /> Search Results</>
                )}
             </div>
             <div className="px-3 pb-3 grid grid-cols-1 gap-1">
                {filteredProducts.map((product) => (
                    <div 
                        key={product.id}
                        className={cn(
                            "flex items-center justify-between p-2 rounded-md transition-all cursor-pointer group",
                            "bg-card/40 hover:bg-card", // Floating look
                            selectedProduct?.id === product.id ? "bg-primary/20" : ""
                        )}
                        onClick={() => selectProduct(product)}
                    >
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-sm bg-muted flex items-center justify-center overflow-hidden shrink-0 border">
                                {product.image ? (
                                    <img src={product.image} alt="" className="h-full w-full object-cover" />
                                ) : <Package className="h-4 w-4 opacity-50" />}
                            </div>
                            <div>
                                <p className="text-sm font-medium leading-tight">{product.name}</p>
                                <p className="text-xs text-muted-foreground mt-0.5 font-mono">{formatCurrency(product.price)}</p>
                            </div>
                        </div>
                        <Button 
                            size="sm" 
                            variant={addedFeedback[product.id] ? "default" : "secondary"}
                            className={cn(
                                "h-7 px-3 text-xs opacity-0 group-hover:opacity-100 transition-all",
                                selectedProduct?.id === product.id && "opacity-100",
                                addedFeedback[product.id] && "bg-emerald-600 hover:bg-emerald-600 text-white opacity-100"
                            )}
                            onClick={(e) => {
                                e.stopPropagation();
                                addToCart(product, 1);
                            }}
                        >
                             {addedFeedback[product.id] ? (
                                 <><Check className="h-3 w-3 mr-1" /> Added</>
                             ) : (
                                 <><Plus className="h-3 w-3 mr-1" /> Add</>
                             )}
                        </Button>
                    </div>
                ))}
            </div>
          </div>

          
          {/* Cart List - Ultra Compact */}
          <div className="flex-1 overflow-hidden bg-muted/5 relative">
            <Separator />
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
               Current Sale
            </div>
            {cartItems.length === 0 ? (
               <div className="h-40 flex flex-col items-center justify-center text-muted-foreground/40 mt-10">
                  <ShoppingBag className="h-10 w-10 mb-2 opacity-20" />
                  <p className="text-sm font-medium">No items yet</p>
               </div>
            ) : (
              <ScrollArea className="h-[calc(100%-2.5rem)]">
                <div className="flex flex-col">
                  {cartItems.map((item, index) => (
                    <div
                      key={item.id}
                      className={cn(
                        "group flex items-center gap-3 py-2 px-4 transition-colors",
                         "bg-card/20 hover:bg-card/40 mb-px rounded-sm" // Tiny gap (mb-px) + subtle bg
                      )}
                    >
                       {/* Index Number */}
                       <span className="text-xs text-muted-foreground w-4 text-center">{index + 1}</span>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex items-center justify-between gap-2">
                           <p className="font-medium text-sm truncate leading-none mb-1">{item.name}</p>
                           <p className="font-semibold text-sm mr-1">{formatCurrency(item.price * item.quantity)}</p>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                           <span>{formatCurrency(item.price)} each</span>
                           {item.category && <span>• {item.category}</span>}
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity bg-muted/20 rounded-md p-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-sm hover:bg-card hover:text-foreground"
                          onClick={() => updateCartQuantity(item.id, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-xs font-semibold tabular-nums">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-sm hover:bg-card hover:text-foreground"
                          onClick={() => updateCartQuantity(item.id, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mr-2"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>

        {/* Footer - Compact & Powerful */}
        <div className="bg-card border-t p-4 shadow-[0_-4px_12px_-4px_rgba(0,0,0,0.05)] z-20 shrink-0">
          <div className="flex items-center justify-between mb-3 px-1">
             <div className="text-sm text-muted-foreground">
                Total Items: <span className="font-medium text-foreground">{cartItems.reduce((a, b) => a + b.quantity, 0)}</span>
             </div>
             <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium text-muted-foreground">Total Bill</span>
                <span className="text-2xl font-bold tracking-tight">{formatCurrency(total)}</span>
             </div>
          </div>
          
          <Button 
            size="lg" 
            className="w-full h-11 text-base font-semibold shadow-sm active:scale-[0.99] transition-all"
            disabled={cartItems.length === 0}
            onClick={handleCheckout}
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Receipt & Confirm
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default QuickSellSheet;
