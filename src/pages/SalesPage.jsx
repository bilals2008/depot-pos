// File: ogs-client/depot/src/pages/SalesPage.jsx
import CheckoutDialog from "@/components/pos/CheckoutDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
    ArrowLeft,
    Check,
    Minus,
    Package,
    Plus,
    Printer,
    ScanBarcode,
    Search,
    ShoppingBag,
    Trash2,
    TrendingUp,
    X
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { useSales } from "@/context/SalesContext";
import { useProducts } from "@/hooks/useProducts"; // Hook Import

const SalesPage = ({ onNavigate }) => {
    const { cartItems, addToCart, updateCartQuantity, removeFromCart, clearCart, total } = useCart();
    const { addSale } = useSales();

    // Fetch real products from DB
    const { products, fetchProducts } = useProducts();

    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [addedFeedback, setAddedFeedback] = useState({}); // { [id]: boolean }
    const searchInputRef = useRef(null);

    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [transactionId] = useState(() => (Math.random() * 10000).toFixed(0));

    // Focus search on mount
    useEffect(() => {
        searchInputRef.current?.focus();
        fetchProducts(); // Ensure we have latest products
    }, [fetchProducts]);

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Filter products based on debounced search
    const filteredProducts = useMemo(() => {
        if (!products) return []; // Guard against loading state

        // Base filter: allow all products, handled visually if out of stock
        // const inStockProducts = products.filter(p => p.stock > 0); 
        const allProducts = products;

        if (!debouncedQuery.trim()) {
            return allProducts.slice(0, 10).map(p => ({ ...p, isTopPick: true }));
        }
        const query = debouncedQuery.toLowerCase();
        return allProducts.filter(
            (p) =>
                (p.name && p.name.toLowerCase().includes(query)) ||
                (p.barcode && p.barcode.includes(query))
        ).slice(0, 20);
    }, [debouncedQuery, products]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Add item handler (wraps context function for feedback)
    const handleAddToCart = (productToAdd = selectedProduct, qty = quantity) => {
        if (!productToAdd) return;

        // Strict Stock Check
        if (productToAdd.stock <= 0) {
            toast.error("Out of Stock", {
                description: `${productToAdd.name} is not available.`
            });
            return;
        }

        addToCart(productToAdd, qty);

        setAddedFeedback(prev => ({ ...prev, [productToAdd.id]: true }));
        setTimeout(() => {
            setAddedFeedback(prev => ({ ...prev, [productToAdd.id]: false }));
        }, 1000);

        if (productToAdd === selectedProduct) {
            setSelectedProduct(null);
            setSearchQuery("");
            setQuantity(1);
            searchInputRef.current?.focus();
        }
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) return;
        setCheckoutOpen(true);
    };

    const handleCheckoutComplete = async (paymentMethod = "Cash") => {
        // Create new sale record
        const newSale = {
            id: `ORD-${transactionId}-${Date.now().toString().slice(-4)}`,
            totalAmount: total, // Match schema: totalAmount
            paymentMethod: paymentMethod === 'digital' ? 'Digital' : 'Cash', // Normalize
            items: cartItems.map(item => ({
                productId: item.id,
                quantity: item.quantity,
                price: item.price
            }))
        };

        try {
            await addSale(newSale); // Save to DB

            toast.success("Sale completed successfully", {
                description: `Order ${newSale.id} processed.`
            });

            clearCart();
            setSearchQuery("");
            setSelectedProduct(null);
            setQuantity(1);
            setCheckoutOpen(false);
            fetchProducts(); // Refresh stock immediately
        } catch {
            toast.error("Failed to complete sale", {
                description: "Please try again."
            });
        }
    };

    const selectProduct = (product) => {
        setSelectedProduct(product);
        setSearchQuery(product.name);
        searchInputRef.current?.focus();
    }

    return (
        <div className="flex h-full w-full bg-background overflow-hidden transition-colors duration-300">

            {/* Left Pane: Search & Catalog */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* Header */}
                <div className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center px-6 justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => onNavigate?.('/')} className="hover:bg-accent">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="text-lg font-bold tracking-tight text-primary">New Sale</h1>
                    </div>

                    <div className="font-mono text-sm text-muted-foreground">
                        Transaction #{transactionId}
                    </div>
                </div>

                {/* Search Area */}
                <div className="p-6 shrink-0">
                    <div className="flex gap-4 max-w-3xl mx-auto items-end">
                        <div className="relative flex-1">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                                {selectedProduct ? <Package className="h-5 w-5" /> : <Search className="h-5 w-5" />}
                            </div>
                            <Input
                                ref={searchInputRef}
                                placeholder="Scan barcode or search products..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    if (!e.target.value) setSelectedProduct(null);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        if (selectedProduct) {
                                            handleAddToCart();
                                        } else if (filteredProducts.length > 0) {
                                            handleAddToCart(filteredProducts[0], quantity);
                                        }
                                    }
                                }}
                                className={cn(
                                    "h-14 pl-12 pr-10 text-lg shadow-sm bg-card border-border",
                                    selectedProduct && "border-primary ring-1 ring-primary bg-primary/5"
                                )}
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setSelectedProduct(null);
                                        setQuantity(1);
                                        searchInputRef.current?.focus();
                                    }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-1 border border-border rounded-lg h-14 px-2 bg-card shrink-0">
                            <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-accent" onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                                <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                                type="number"
                                value={quantity}
                                onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-16 h-10 text-center border-0 p-0 text-lg font-medium focus-visible:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-transparent text-foreground"
                            />
                            <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-accent" onClick={() => setQuantity(q => q + 1)}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="h-14 px-6 flex items-center justify-center bg-card rounded-lg min-w-30 shrink-0 border border-border shadow-sm">
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] uppercase font-bold text-primary tracking-widest">Item ID</span>
                                <span className="text-lg font-mono font-bold text-foreground">
                                    {selectedProduct ? selectedProduct.id : "---"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Grid */}
                <ScrollArea className="flex-1 px-6 pb-6">
                    <div className="max-w-3xl mx-auto">
                        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                            {(!searchQuery || searchQuery.length === 0) ? (
                                <><TrendingUp className="h-4 w-4" /> Frequent Items</>
                            ) : (
                                <><Search className="h-4 w-4" /> Results</>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-1">
                            {filteredProducts.map((product) => (
                                <div
                                    key={product.id}
                                    className={cn(
                                        "flex items-center p-3 rounded-xl border border-border transition-all cursor-pointer group",
                                        "bg-card hover:shadow-md hover:border-primary",
                                        selectedProduct?.id === product.id ? "border-primary ring-1 ring-primary bg-primary/5" : "",
                                        product.stock <= 0 ? "opacity-60 grayscale-[0.5]" : ""
                                    )}
                                    onClick={() => selectProduct(product)}
                                >
                                    <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center shrink-0 border border-border font-mono text-xs font-bold text-muted-foreground relative overflow-hidden">
                                        {product.barcode ? product.barcode.slice(-4) : "ID"}
                                    </div>
                                    <div className="ml-3 flex-1 min-w-0">
                                        <p className="font-medium truncate text-foreground">{product.name}</p>
                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
                                            <span className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-mono font-medium">
                                                #{product.barcode || product.id}
                                            </span>
                                            <p className="text-sm text-primary font-mono">{formatCurrency(product.price)}</p>
                                            <span className={cn(
                                                "text-[10px]",
                                                product.stock <= 0 ? "text-red-500 font-bold" : "text-muted-foreground"
                                            )}>
                                                ({product.stock} in stock)
                                            </span>
                                        </div>
                                    </div>

                                    <Button
                                        size="sm"
                                        disabled={product.stock <= 0}
                                        variant={addedFeedback[product.id] ? "default" : "secondary"}
                                        className={cn(
                                            "ml-2 shrink-0 transition-all",
                                            addedFeedback[product.id] ? "bg-green-600 hover:bg-green-700 text-white" : "bg-primary hover:bg-primary/90 text-primary-foreground"
                                        )}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAddToCart(product, quantity);
                                        }}
                                    >
                                        {addedFeedback[product.id] ? (
                                            <Check className="h-4 w-4" />
                                        ) : (
                                            <Plus className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            ))}
                            {filteredProducts.length === 0 && (
                                <div className="col-span-full py-12 text-center text-muted-foreground">
                                    No products found matching "{searchQuery}"
                                </div>
                            )}
                        </div>
                    </div>
                </ScrollArea>
            </div>

            {/* Right Pane: Cart & Totals */}
            <div className="w-100 bg-card border-l border-border flex flex-col shadow-2xl z-10">
                <div className="h-16 flex items-center px-6 border-b border-border shrink-0 bg-muted/30 backdrop-blur-sm">
                    <ShoppingBag className="h-5 w-5 mr-3 text-primary" />
                    <h2 className="font-semibold text-lg">Current Sale</h2>
                    <span className="ml-3 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-bold">
                        {cartItems.reduce((a, b) => a + b.quantity, 0)}
                    </span>
                    {cartItems.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => clearCart()}
                            className="ml-auto text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                            Clear All
                        </Button>
                    )}
                </div>

                <div className="flex-1 overflow-hidden relative">
                    {cartItems.length === 0 ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground/30 p-8 text-center animate-in fade-in zoom-in-95 duration-300">
                            <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-4">
                                <ShoppingBag className="h-10 w-10 opacity-50" />
                            </div>
                            <p className="text-lg font-medium text-foreground/50">Your cart is empty</p>
                            <p className="text-sm mt-2 max-w-50">Scan items or select from the list to start a sale</p>
                        </div>
                    ) : (
                        <ScrollArea className="h-full">
                            <div className="p-4 space-y-3">
                                {cartItems.map((item) => {
                                    const product = products.find(p => p.id === item.id);
                                    const currentStock = product ? product.stock : 0;
                                    return (
                                        <div key={item.id} className="group bg-muted/30 border border-border/50 hover:border-primary/50 rounded-xl p-3 transition-all shadow-sm">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="font-medium text-sm leading-snug line-clamp-2 pr-2">
                                                    {item.name}
                                                </div>
                                                <div className="font-bold text-sm whitespace-nowrap">
                                                    {formatCurrency(item.price * item.quantity)}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="text-xs text-muted-foreground font-mono">
                                                    {formatCurrency(item.price)} x {item.quantity}
                                                </div>
                                                <div className="flex items-center gap-1 bg-background rounded-lg shadow-sm border border-border/50 p-0.5">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 rounded-md"
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
                                                        disabled={item.quantity >= currentStock}
                                                        className="h-6 w-6 rounded-md hover:text-blue-600 disabled:opacity-30"
                                                        onClick={() => {
                                                            if (item.quantity < currentStock) {
                                                                updateCartQuantity(item.id, 1);
                                                            } else {
                                                                toast.error("Max stock reached");
                                                            }
                                                        }}
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md ml-1"
                                                    onClick={() => removeFromCart(item.id)}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </ScrollArea>
                    )}
                </div>

                <div className="bg-muted border-t border-border p-6 space-y-4 shrink-0">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Subtotal</span>
                            <span>{formatCurrency(total)}</span>
                        </div>
                        <div className="flex justify-between text-base font-bold text-foreground">
                            <span>Total To Pay</span>
                            <span className="text-2xl text-primary">{formatCurrency(total)}</span>
                        </div>
                    </div>

                    <Button
                        size="lg"
                        className="w-full h-12 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                        disabled={cartItems.length === 0}
                        onClick={handleCheckout}
                    >
                        <div className="flex items-center justify-between w-full px-2">
                            <span>Checkout</span>
                            <span className="text-urdu text-lg opacity-80">ادائیگی</span>
                        </div>
                    </Button>
                </div>
            </div>

            <CheckoutDialog
                open={checkoutOpen}
                onOpenChange={setCheckoutOpen}
                cartItems={cartItems}
                total={total}
                onComplete={handleCheckoutComplete}
            />
        </div>
    );
};

export default SalesPage;
