// File: ogs-client/depot/src/pages/ReturnsPage.jsx
import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Search,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  Package,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  AlertCircle
} from "lucide-react";
import { useSales } from "@/context/SalesContext";

import { useSettings } from "@/context/SettingsContext";
import { useNavigation } from "@/context/NavigationContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Note: Using global SalesContext for persistence.

const ReturnsPage = () => {
  const { processReturn } = useSales();
  const [sales, setSales] = useState([]); // Local state for search results
  const { t } = useSettings();
  const { navParams, clearParams } = useNavigation();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [foundOrder, setFoundOrder] = useState(null);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [returnQuantities, setReturnQuantities] = useState({});
  const [returnMode, setReturnMode] = useState("cash"); // 'cash' or 'exchange'
  const [returnReason, setReturnReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Exchange mode state
  const [exchangeCart, setExchangeCart] = useState([]);
  const [productSearch, setProductSearch] = useState("");

  // Autocomplete states
  const [open, setOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);

  // Products state
  const [products, setProducts] = useState([]);

  // Fetch products from DB
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (window.electron) {
          const dbProducts = await window.electron.getAllProducts();
          setProducts(dbProducts || []);
        }
      } catch (err) {
        console.error("Failed to load products:", err);
        toast.error("Failed to load product list.");
      }
    };
    fetchProducts();
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch sales for autocomplete when debouncedSearch changes
  useEffect(() => {
    const searchSales = async () => {
      if (!debouncedSearch.trim()) {
        setSales([]);
        return;
      }
      try {
        const result = await window.electron.getSalesPaginated({
          searchTerm: debouncedSearch,
          pageSize: 20
        });
        setSales(result.sales || []);
      } catch (err) {
        console.error("Failed to search sales:", err);
      }
    };
    searchSales();
  }, [debouncedSearch]);

  // Filter orders for autocomplete (Non-returned & Available)
  const availableOrders = useMemo(() => {
    return sales.filter(s =>
      (s.status !== "Returned" && s.status !== "Exchanged")
    );
  }, [sales]);

  const handleSearch = useCallback(async (orderId = searchTerm) => {
    setIsLoading(true);
    setFoundOrder(null);

    try {
      const result = await window.electron.getSalesPaginated({
        searchTerm: orderId,
        pageSize: 1
      });

      const order = result.sales.find(s => s.id.toLowerCase() === orderId.toLowerCase());

      if (order) {
        if (order.status === "Returned" || order.status === "Exchanged") {
          toast.error("This order has already been processed for return/exchange.");
        } else {
          setFoundOrder(order);
          setSelectedItems(new Set());
          setReturnQuantities({});
          setExchangeCart([]);
        }
      } else {
        toast.error("Order not found. Please check the Order ID.");
      }
    } catch (e) {
      console.error("Search failed:", e);
      toast.error("Search failed.");
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);

  // Auto-search logic
  useEffect(() => {
    if (navParams && navParams.orderId) {
      setSearchTerm(navParams.orderId);
    }
  }, [navParams]);

  useEffect(() => {
    if (navParams?.orderId && searchTerm === navParams.orderId) {
      handleSearch(navParams.orderId);
      // Clear params after successful search trigger
      const timer = setTimeout(() => clearParams(), 500);
      return () => clearTimeout(timer);
    }
  }, [searchTerm, navParams, handleSearch, clearParams]);


  const toggleItemSelection = (itemId, maxQty) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
        setReturnQuantities(prevQtys => {
          const newQtys = { ...prevQtys };
          delete newQtys[itemId];
          return newQtys;
        });
      }
      else {
        next.add(itemId);
        setReturnQuantities(prevQtys => ({
          ...prevQtys,
          [itemId]: maxQty // Default to max quantity
        }));
      }
      return next;
    });
  };

  const handleQuantityChange = (itemId, delta, maxQty) => {
    setReturnQuantities(prev => {
      const current = prev[itemId] || 1;
      const newQty = Math.max(1, Math.min(maxQty, current + delta));
      return { ...prev, [itemId]: newQty };
    });
  };

  const refundAmount = useMemo(() => {
    if (!foundOrder) return 0;
    return foundOrder.items
      .filter(item => selectedItems.has(item.id))
      .reduce((sum, item) => sum + (item.price * (returnQuantities[item.id] || item.quantity)), 0);
  }, [foundOrder, selectedItems, returnQuantities]);

  const exchangeTotal = useMemo(() => {
    return exchangeCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [exchangeCart]);

  const balanceDue = refundAmount - exchangeTotal;

  // Exchange Cart Handlers
  const addToExchange = (product) => {
    setExchangeCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setProductOpen(false);
  };

  const updateExchangeQty = (id, delta) => {
    setExchangeCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromExchange = (id) => {
    setExchangeCart(prev => prev.filter(item => item.id !== id));
  };


  const handleConfirmReturn = async () => {
    if (!foundOrder) return;
    if (selectedItems.size === 0) {
      toast.error("Please select at least one item to return.");
      return;
    }
    if (!returnReason.trim()) {
      toast.error("Please provide a reason for the return.");
      return;
    }

    // Prepare Payload
    const returnedItemsList = foundOrder.items
      .filter(item => selectedItems.has(item.id))
      .map(item => ({
        id: item.productId || item.id,
        quantity: returnQuantities[item.id] || item.quantity
      }));
    // Note: item.id might be product id if not distinct from table id.
    // In sales schema, we just store productId, usually mapped to 'id' in UI if flat.
    // sales.items usually have productId. Let's check foundOrder structure.
    // Assuming foundOrder.items has 'productId' or 'id' is the product id.
    // Looking at ReturnsPage, it uses item.id for key.
    // In db.js createSale, item has productId. In getSales (db -> UI), we might have mapped it.
    // Assuming item.id is the product ID for now based on typical usage.

    const exchangeItemsList = exchangeCart.map(item => ({
      id: item.id,
      quantity: item.quantity
    }));

    try {
      await processReturn({
        saleId: foundOrder.id,
        returnedItems: returnedItemsList,
        exchangeItems: exchangeItemsList,
        returnMode,
        reason: returnReason
      });

      toast.success(`Return processed successfully as ${returnMode === "cash" ? "Cash Refund" : "Exchange"}.`);

      // Reset state
      setFoundOrder(null);
      setSearchTerm("");
      setSelectedItems(new Set());
      setReturnQuantities({});
      setReturnReason("");
      setExchangeCart([]);
    } catch {
      toast.error("Failed to process return. Please try again.");
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-background p-4 overflow-hidden font-outfit" style={{ fontFamily: 'Outfit, sans-serif' }}>

      {/* Header - Compact & Clean */}
      <div className="flex items-center justify-between mb-3 shrink-0 px-1">
        <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <RotateCcw className="h-5 w-5 text-primary" />
          {t("Returns & Exchanges")}
        </h1>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div className="relative w-64 group cursor-pointer">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors z-10" />
              <div className="h-9 pl-9 pr-3 rounded-md border border-border/40 bg-card hover:bg-accent/50 hover:border-accent transition-all flex items-center shadow-sm">
                <span className="text-sm text-muted-foreground font-medium truncate">
                  {foundOrder ? foundOrder.id : "Search Order ID..."}
                </span>
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0 border-border bg-card shadow-xl" align="end">
            <Command className="bg-transparent">
              <CommandInput
                placeholder="Type to search..."
                value={searchTerm}
                onValueChange={setSearchTerm}
                className="h-9 border-none focus:ring-0 font-medium text-sm"
                autoFocus
              />
              <CommandList className="max-h-64 overflow-y-auto border-t border-border/20">
                <CommandEmpty className="py-4 text-center text-xs text-muted-foreground">No orders found</CommandEmpty>
                <CommandGroup heading="Available Orders" className="p-1.5">
                  {availableOrders.map((order) => (
                    <CommandItem
                      key={order.id}
                      value={order.id}
                      onSelect={(currentValue) => {
                        handleSearch(currentValue);
                        setSearchTerm("");
                        setOpen(false);
                      }}
                      className="flex items-center justify-between py-1.5 px-2 cursor-pointer aria-selected:bg-primary/10 aria-selected:text-primary transition-all rounded"
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-xs">{order.id}</span>
                        <span className="text-[9px] opacity-60">{new Date(order.date).toLocaleDateString()}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-xs font-bold">Rs. {order.total}</p>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Unified Card Container */}
      <div className="flex-1 bg-background border border-border/40 rounded-xl shadow-sm flex overflow-hidden">

        {/* Left Column: Items Grid */}
        <div className="flex-1 flex flex-col min-w-0 bg-background relative">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin mb-3" />
              <p className="text-xs font-medium text-muted-foreground">Searching...</p>
            </div>
          ) : !foundOrder ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
              <Package className="h-10 w-10 opacity-50 mb-3" />
              <p className="text-sm font-medium opacity-80">No order selected</p>
              <p className="text-urdu text-sm mt-1 opacity-70">آرڈر تلاش کریں</p>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {/* Order Info Header - Tight */}
              <div className="px-5 py-3 border-b border-border/40 flex items-center justify-between shrink-0 bg-background">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-black tracking-tight text-foreground">{foundOrder.id}</h2>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-0 h-5 text-[10px] px-1.5 font-bold uppercase tracking-wider">
                    {foundOrder.status}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFoundOrder(null)}
                    className="h-6 px-2 text-[10px] font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/5 -ml-1"
                  >
                    Clear
                  </Button>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-foreground">{new Date(foundOrder.date).toLocaleDateString()}</p>
                  <p className="text-[10px] text-muted-foreground">Walking Customer</p>
                </div>
              </div>

              {/* Data Table Area - Dense */}
              <div className="flex-1 overflow-auto p-4">
                <div className="rounded-md border border-border/40 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/40 h-8">
                      <TableRow className="border-border/40 hover:bg-muted/40 text-[11px] uppercase tracking-wider">
                        <TableHead className="w-10 h-8 py-0"></TableHead>
                        <TableHead className="h-8 py-0 font-bold text-muted-foreground">Item</TableHead>
                        <TableHead className="h-8 py-0 text-center w-28 font-bold text-muted-foreground">Qty Return</TableHead>
                        <TableHead className="h-8 py-0 text-right w-24 font-bold text-muted-foreground">Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {foundOrder.items.map((item) => (
                        <TableRow
                          key={item.id}
                          className={cn(
                            "h-10 border-b border-white/5 transition-colors cursor-pointer group",
                            selectedItems.has(item.id) ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/30"
                          )}
                          onClick={(e) => {
                            // prevent toggling when clicking buttons inside
                            if (e.target.closest('button')) return;
                            toggleItemSelection(item.id, item.quantity);
                          }}
                        >
                          <TableCell className="py-0">
                            <Checkbox
                              checked={selectedItems.has(item.id)}
                              onCheckedChange={() => toggleItemSelection(item.id, item.quantity)}
                            />
                          </TableCell>
                          <TableCell className="font-medium text-sm py-0 text-foreground group-hover:text-primary transition-colors">
                            {item.name}
                            <div className="text-[10px] text-muted-foreground font-normal">Purchased: {item.quantity}</div>
                          </TableCell>
                          <TableCell className="text-center text-sm py-0">
                            {selectedItems.has(item.id) ? (
                              <div className="flex items-center justify-center gap-1 bg-background border border-border/50 rounded-md h-7 w-24 mx-auto shadow-sm" onClick={e => e.stopPropagation()}>
                                <button
                                  className="h-7 w-7 flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuantityChange(item.id, -1, item.quantity);
                                  }}
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="text-xs font-bold w-6 text-center">{returnQuantities[item.id] || 1}</span>
                                <button
                                  className="h-7 w-7 flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuantityChange(item.id, 1, item.quantity);
                                  }}
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-muted-foreground/40 text-xs">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm py-0">
                            Rs. {item.price.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="mt-4">
                  <Label className="text-xs font-bold flex w-full items-center gap-1.5 justify-between mb-1.5 text-muted-foreground">
                    Return Reason
                    <span className="text-urdu text-xs font-normal opacity-60 mb-1 mr-2">واپسی کی وجہ</span>
                  </Label>
                  <Input
                    placeholder="Enter reason..."
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="h-9 bg-background border-border/40 text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="w-px bg-border/40 h-full shrink-0" />

        {/* Right Column: Sidebar Action Panel */}
        <div className="w-85 bg-background flex flex-col h-full shrink-0 relative">
          {!foundOrder ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center opacity-40">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <RotateCcw className="h-5 w-5" />
              </div>
              <p className="text-xs font-medium">Select an order to view actions</p>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {/* Content Stack */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">

                {/* 1. Mode Selection */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Return Mode</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setReturnMode("cash")}
                      className={cn(
                        "flex flex-col items-center justify-center p-2 rounded-lg border transition-all h-20 group relative overflow-hidden",
                        returnMode === "cash"
                          ? "bg-orange-500/10 border-orange-500 shadow-sm"
                          : "bg-muted/30 border-transparent hover:bg-background hover:border-border/30"
                      )}
                    >
                      <div className={cn(
                        "rounded-full p-2 mb-1.5 transition-colors",
                        returnMode === "cash" ? "bg-orange-500/20 text-orange-600 dark:text-orange-400" : "bg-muted text-muted-foreground group-hover:text-foreground"
                      )}>
                        <RotateCcw className="h-4 w-4" />
                      </div>
                      <span className={cn(
                        "text-xs font-bold transition-colors",
                        returnMode === "cash" ? "text-orange-700 dark:text-orange-300" : "text-muted-foreground group-hover:text-foreground"
                      )}>Refund</span>
                    </button>
                    <button
                      onClick={() => setReturnMode("exchange")}
                      className={cn(
                        "flex flex-col items-center justify-center p-2 rounded-lg border transition-all h-20 group relative overflow-hidden",
                        returnMode === "exchange"
                          ? "bg-blue-500/10 border-blue-500 shadow-sm"
                          : "bg-muted/30 border-transparent hover:bg-background hover:border-border/30"
                      )}
                    >
                      <div className={cn(
                        "rounded-full p-2 mb-1.5 transition-colors",
                        returnMode === "exchange" ? "bg-blue-500/20 text-blue-600 dark:text-blue-400" : "bg-muted text-muted-foreground group-hover:text-foreground"
                      )}>
                        <ShoppingCart className="h-4 w-4" />
                      </div>
                      <span className={cn(
                        "text-xs font-bold transition-colors",
                        returnMode === "exchange" ? "text-blue-700 dark:text-blue-300" : "text-muted-foreground group-hover:text-foreground"
                      )}>Exchange</span>
                    </button>
                  </div>
                </div>

                {/* 2. Exchange Logic */}
                {returnMode === "exchange" && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Add Items</span>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        placeholder="Search product..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        onFocus={() => setProductOpen(true)}
                        className="pl-8 h-9 text-xs bg-background border-border/40 shadow-sm focus-visible:ring-1 focus-visible:ring-primary"
                      />
                      {/* Product Dropdown (Simplified for compactness) */}
                      {productOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-popover border border-border/40 rounded-md shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                          {products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).length === 0 ? (
                            <div className="p-3 text-center text-xs text-muted-foreground">No matches</div>
                          ) : (
                            products
                              .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))
                              .map((product) => (
                                <div
                                  key={product.id}
                                  onClick={() => {
                                    addToExchange(product);
                                    setProductSearch("");
                                    setProductOpen(false);
                                  }}
                                  className="flex items-center justify-between p-2 cursor-pointer hover:bg-accent text-xs"
                                >
                                  <span>{product.name}</span>
                                  <span className="font-mono font-bold">Rs. {product.price}</span>
                                </div>
                              ))
                          )}
                        </div>
                      )}
                      {productOpen && <div className="fixed inset-0 z-40" onClick={() => setProductOpen(false)} />}
                    </div>

                    {/* Cart Items */}
                    <div className="space-y-1.5 pt-2">
                      {exchangeCart.map(item => (
                        <div key={item.id} className="flex items-center justify-between bg-background p-2 rounded border border-border/30 shadow-sm animate-in slide-in-from-left-2 duration-200">
                          <div className="flex-1 min-w-0 mr-2">
                            <div className="text-xs font-medium truncate" title={item.name}>{item.name}</div>
                            <div className="text-[10px] text-muted-foreground font-mono">Rs. {item.price} x {item.quantity}</div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => updateExchangeQty(item.id, -1)}><Minus className="h-3 w-3" /></Button>
                            <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => updateExchangeQty(item.id, 1)}><Plus className="h-3 w-3" /></Button>
                            <div className="w-px h-3 bg-border mx-1" />
                            <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => removeFromExchange(item.id)}><Trash2 className="h-3 w-3" /></Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Footer Section (Financials & Action) */}
              <div className="mt-auto border-t border-border/40 bg-background p-4 space-y-4">
                <div className="space-y-1">
                  {/* Subtotals */}
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Return Total</span>
                    <span className="font-mono">Rs. {refundAmount.toLocaleString()}</span>
                  </div>
                  {returnMode === "exchange" && (
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>New Items</span>
                      <span className="font-mono text-destructive">-Rs. {exchangeTotal.toLocaleString()}</span>
                    </div>
                  )}

                  {/* Net Total */}
                  <div className="flex justify-between items-baseline pt-2 border-t border-dashed border-border/40 mt-2">
                    <span className="text-sm font-bold text-foreground">
                      {balanceDue >= 0 ? "Refund Amount" : "Payable Amount"}
                    </span>
                    <span className={cn(
                      "text-3xl font-black tracking-tighter",
                      balanceDue < 0 ? "text-destructive" : (returnMode === "cash" ? "text-orange-500" : "text-blue-500")
                    )}>
                      Rs. {Math.abs(balanceDue).toLocaleString()}
                    </span>
                  </div>
                </div>

                <Button
                  className={cn(
                    "w-full h-12 text-base font-bold shadow-lg transition-all",
                    returnMode === "cash"
                      ? "bg-orange-500 hover:bg-orange-600 shadow-orange-500/20 text-white"
                      : "bg-blue-500 hover:bg-blue-600 shadow-blue-500/20 text-white"
                  )}
                  size="lg"
                  disabled={selectedItems.size === 0 || !returnReason}
                  onClick={handleConfirmReturn}
                >
                  Confirm {returnMode === "cash" ? "Refund" : "Exchange"}
                  <ArrowRight className="ml-2 h-5 w-5 opacity-80" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReturnsPage;
