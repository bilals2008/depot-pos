// File: ogs-client/depot/src/components/pos/ProductGrid.jsx
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Barcode } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import ProductCard from "./ProductCard";

const ProductGrid = ({ products, addToCart, categories, onBarcodeScanned }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [barcodeInput, setBarcodeInput] = useState("");
  const barcodeRef = useRef(null);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle barcode input (simulates scanner behavior)
  const handleBarcodeKeyDown = (e) => {
    if (e.key === "Enter" && barcodeInput.trim()) {
      onBarcodeScanned(barcodeInput.trim());
      setBarcodeInput("");
    }
  };

  // Auto-focus barcode input on mount
  useEffect(() => {
    barcodeRef.current?.focus();
  }, []);

  return (
    <div className="h-full flex flex-col bg-muted/20">
      {/* Header with Search and Barcode */}
      <div className="p-4 pb-2 space-y-3 bg-background/80 backdrop-blur-sm border-b z-10">
        <div className="flex gap-3">
          {/* Barcode Input */}
          <div className="relative flex-1 max-w-[200px]">
            <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={barcodeRef}
              placeholder="Scan barcode..."
              className="pl-9 h-10 bg-background font-mono text-sm"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              onKeyDown={handleBarcodeKeyDown}
            />
          </div>
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-9 h-10 bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className={`cursor-pointer px-3 py-1.5 text-xs transition-all hover:scale-105 active:scale-95 whitespace-nowrap ${
                selectedCategory === category
                  ? "shadow-md shadow-primary/20"
                  : "bg-background hover:bg-muted border-border"
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <ScrollArea className="flex-1 px-4 pb-4 w-full">
        {filteredProducts.length === 0 ? (
          <div className="h-[50vh] flex flex-col items-center justify-center text-muted-foreground gap-2">
            <Search className="h-12 w-12 opacity-20" />
            <p>No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 pt-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} addToCart={addToCart} />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default ProductGrid;
