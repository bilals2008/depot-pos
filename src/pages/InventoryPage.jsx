// File: ogs-client/depot/src/pages/InventoryPage.jsx
import { useState, useMemo, useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  Package,
  AlertTriangle,
  PackageX,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  History
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import StatCard from "@/components/dashboard/StatCard";
import ProductDialog from "@/components/inventory/ProductDialog";
import DeleteAlert from "@/components/inventory/DeleteAlert";

import { useSettings } from "@/context/SettingsContext";
import { useNavigation } from "@/context/NavigationContext";
import { cn } from "@/lib/utils";
import { useProducts } from "@/hooks/useProducts"; // Custom Hook

const InventoryPage = ({ onNavigate }) => {
  const { t } = useSettings();
  const { setParams } = useNavigation();
  
  // Database Hook
  const { products, loading: isLoading, addProduct, updateProduct, deleteProduct } = useProducts();

  const [searchQuery, setSearchQuery] = useState("");
  
  // Sorting State
  const [sortColumn, setSortColumn] = useState(null); 
  const [sortDirection, setSortDirection] = useState(null); 
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Filter State
  const [statusFilter, setStatusFilter] = useState("all");

  // Dialog States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  // Stats Calculation
  const stats = useMemo(() => {
    return {
      totalProducts: products.length,
      lowStock: products.filter(p => p.stock > 0 && p.stock < 5).length,
      outOfStock: products.filter(p => p.stock === 0).length
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = products.filter(product => {
      const matchesSearch = 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.barcode && product.barcode.includes(searchQuery));
      
      const matchesStatus = 
        statusFilter === "all" ||
        (statusFilter === "in-stock" && product.stock >= 5) ||
        (statusFilter === "low-stock" && product.stock > 0 && product.stock < 5) ||
        (statusFilter === "out-of-stock" && product.stock === 0);

      return matchesSearch && matchesStatus;
    });

    if (sortColumn && sortDirection) {
      result = [...result].sort((a, b) => {
        let valA = a[sortColumn];
        let valB = b[sortColumn];

        // Handle numeric sorting for price and stock
        if (sortColumn === 'price' || sortColumn === 'stock') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }

        // Default string sorting
        valA = String(valA || "").toLowerCase();
        valB = String(valB || "").toLowerCase();

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [products, searchQuery, sortColumn, sortDirection, statusFilter]);

  // Reset to first page when filtering/sorting changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortColumn, sortDirection, statusFilter, pageSize]);

  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const paginatedProducts = filteredProducts.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
  );

  // Handlers
  const toggleRow = (id) => {
    setSelectedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAll = () => {
    const currentPageIds = paginatedProducts.map(p => p.id);
    const allSelected = currentPageIds.length > 0 && currentPageIds.every(id => selectedRows.has(id));
    
    setSelectedRows(prev => {
      const next = new Set(prev);
      if (allSelected) {
        currentPageIds.forEach(id => next.delete(id));
      } else {
        currentPageIds.forEach(id => next.add(id));
      }
      return next;
    });
  };

  const handleBulkDelete = async () => {
    for (const id of selectedRows) {
        await deleteProduct(id);
    }
    setSelectedRows(new Set());
    setIsBulkDeleteOpen(false);
  };

  const handleSaveProduct = async (product) => {
    let result;
    if (product.id) {
        result = await updateProduct(product);
    } else {
        result = await addProduct(product);
    }
    
    if (result.success) {
        setEditingProduct(null);
        setIsAddOpen(false);
    } else {
        alert("Failed to save: " + result.error);
    }
  };

  const handleDeleteProduct = async () => {
    if (deletingProduct) {
        const result = await deleteProduct(deletingProduct.id);
        if (result.success) {
            setDeletingProduct(null);
        } else {
            alert("Failed to delete: " + result.error);
        }
    }
  };

  const handleViewHistory = (productName) => {
    setParams({ productFilter: productName });
    if (onNavigate) {
      onNavigate('/stock-history');
    }
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="flex flex-col h-full bg-background transition-colors duration-300 overflow-hidden">
      {/* Header Container (matching SalesPage) */}
      <div className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center px-6 justify-between shrink-0 font-sans">
        <div>
            <h1 className="text-lg font-bold text-primary flex items-center gap-2 tracking-tight">
                <Package className="h-5 w-5" />
                Inventory Management
            </h1>
        </div>
        <div className="flex items-center gap-3">
             <Button onClick={() => setIsAddOpen(true)} className="h-9 bg-primary text-white hover:bg-primary/90 shadow-sm transition-all active:scale-95">
                <Plus className="h-4 w-4 mr-2" /> {t("Add Product")}
             </Button>
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col gap-6 overflow-hidden">
      
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
        <StatCard 
            label={t("Total Products")} 
            value={stats.totalProducts} 
            icon={Package}
            iconClassName="text-primary"
            iconContainerClassName="bg-primary/10" 
        />
        <StatCard 
            label={t("Low Stock")} 
            value={stats.lowStock} 
            icon={AlertTriangle}
            iconClassName="text-amber-500"
            iconContainerClassName="bg-amber-500/10" 
        />
        <StatCard 
            label={t("Out of Stock")} 
            value={stats.outOfStock} 
            icon={PackageX}
            iconClassName="text-red-500"
            iconContainerClassName="bg-red-500/10" 
        />
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder={t("Search inventory...")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9 pl-9 bg-card border-border text-foreground placeholder:text-muted-foreground/50"
                />
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest hidden lg:block">Filter:</span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 w-full sm:w-40 bg-card border-border text-foreground">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                    <SelectItem value="all">All Products</SelectItem>
                    <SelectItem value="in-stock" className="text-emerald-500 font-medium font-sans">In Stock</SelectItem>
                    <SelectItem value="low-stock" className="text-amber-500 font-medium font-sans">Low Stock</SelectItem>
                    <SelectItem value="out-of-stock" className="text-red-500 font-medium font-sans">Out of Stock</SelectItem>
                </SelectContent>
            </Select>
          </div>
      </div>

      {/* Product Table Container */}
      <div className="border border-border rounded-lg bg-background shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
        
        {/* Bulk Actions Bar (ABOVE Table Header) */}
        <AnimatePresence>
            {selectedRows.size > 0 && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="overflow-hidden shrink-0"
                >
                    <div className={cn(
                        "h-12 w-full flex items-center justify-between px-6 border-b",
                        "bg-muted text-foreground border-border"
                    )}>
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-bold tracking-tight">
                                {selectedRows.size} {selectedRows.size === 1 ? 'Item' : 'Items'} Selected
                            </span>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => setSelectedRows(new Set())}
                                className="h-7 w-7 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-all"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button 
                                variant="ghost" 
                                onClick={() => setIsBulkDeleteOpen(true)}
                                className="h-8 px-3 rounded-lg font-bold flex items-center gap-2 hover:bg-red-500/10 text-red-500 transition-all group"
                            >
                                <Trash2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                Delete
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        <div className="flex-1 overflow-auto">
            <Table>
            <TableHeader className="bg-muted/80 sticky top-0 z-10 backdrop-blur-md">
                <TableRow className="hover:bg-transparent border-b border-border">
                <TableHead className="w-12 pl-6">
                    <Checkbox 
                        checked={paginatedProducts.length > 0 && paginatedProducts.every(p => selectedRows.has(p.id))}
                        onCheckedChange={toggleAll}
                        className="border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all"
                    />
                </TableHead>
                <TableHead 
                  className="text-muted-foreground font-semibold cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-2">
                    {t("Name")}
                    <ArrowUpDown className={cn(
                      "h-3.5 w-3.5 transition-colors",
                      sortColumn === 'name' ? "text-primary" : "text-muted-foreground/30"
                    )} />
                  </div>
                </TableHead> 
                <TableHead 
                  className="text-muted-foreground font-semibold cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleSort('barcode')}
                >
                  <div className="flex items-center gap-2">
                    Barcode / ID
                    <ArrowUpDown className={cn(
                      "h-3.5 w-3.5 transition-colors",
                      sortColumn === 'barcode' ? "text-primary" : "text-muted-foreground/30"
                    )} />
                  </div>
                </TableHead>
                <TableHead 
                  className="text-muted-foreground font-semibold cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleSort('price')}
                >
                  <div className="flex items-center gap-2">
                    {t("Price")}
                    <ArrowUpDown className={cn(
                      "h-3.5 w-3.5 transition-colors",
                      sortColumn === 'price' ? "text-primary" : "text-muted-foreground/30"
                    )} />
                  </div>
                </TableHead>
                <TableHead 
                  className="text-muted-foreground font-semibold cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleSort('stock')}
                >
                  <div className="flex items-center gap-2">
                    {t("Stock")}
                    <ArrowUpDown className={cn(
                      "h-3.5 w-3.5 transition-colors",
                      sortColumn === 'stock' ? "text-primary" : "text-muted-foreground/30"
                    )} />
                  </div>
                </TableHead>
                <TableHead className="text-right text-muted-foreground font-semibold pr-6">{t("Actions")}</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoading ? (
                    // Skeleton Loading States
                    Array.from({ length: pageSize }).map((_, idx) => (
                        <TableRow key={`skeleton-${idx}`}>
                            <TableCell className="py-4"><Skeleton className="h-5 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                            <TableCell className="text-right pr-6"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                        </TableRow>
                    ))
                ) : paginatedProducts.length > 0 ? (
                    paginatedProducts.map((product) => (
                    <TableRow 
                        key={product.id} 
                        className={cn(
                            "hover:bg-muted/50 border-b border-border/50 transition-colors group",
                            selectedRows.has(product.id) && "bg-primary/5 hover:bg-primary/10"
                        )}
                    >
                        <TableCell className="pl-6">
                            <Checkbox 
                                checked={selectedRows.has(product.id)}
                                onCheckedChange={() => toggleRow(product.id)}
                                className="border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all"
                            />
                        </TableCell>
                        <TableCell className="font-bold text-foreground py-4">
                            {product.name}
                        </TableCell>
                        <TableCell className="font-mono text-muted-foreground text-xs">
                            {product.barcode}
                        </TableCell>
                        <TableCell className="font-black text-foreground">
                            {formatCurrency(product.price)}
                        </TableCell>
                        <TableCell>
                             {product.stock <= 0 ? (
                                 <Badge variant="destructive" className="bg-red-500/10 text-red-600 dark:text-red-400 font-bold border-none">{t("Out of Stock")}</Badge>
                             ) : product.stock < 5 ? (
                                 <Badge variant="outline" className="border-amber-500/30 text-amber-600 dark:text-amber-500 bg-amber-500/10 font-bold">Low: {product.stock}</Badge>
                             ) : (
                                 <span className="text-foreground/80 font-medium">{product.stock} Units</span>
                             )}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                            <div className="flex items-center justify-end gap-1">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => handleViewHistory(product.name)}
                                    className="h-8 w-8 hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors"
                                    title="View Stock History"
                                >
                                    <History className="h-4 w-4" />
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => setEditingProduct(product)}
                                    className="h-8 w-8 hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors"
                                    title="Edit Product"
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => setDeletingProduct(product)}
                                    className="h-8 w-8 hover:bg-red-500/10 hover:text-red-600 text-muted-foreground transition-colors"
                                    title="Delete Product"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                            No products found matching your search.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
            </Table>
        </div>

        {/* Pagination Container (Inside Table Border) */}
        {!isLoading && filteredProducts.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 shrink-0 border-t border-border bg-muted/50 backdrop-blur-sm">
                {/* Total Count (Left) */}
                <div className="text-sm text-muted-foreground font-medium font-sans">
                    <span className="font-bold text-foreground/80">{filteredProducts.length}</span> total products
                </div>

                {/* Controls (Right) */}
                <div className="flex items-center gap-6">
                    {/* Rows Per Page Selector */}
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-widest text-[10px]">Rows</span>
                        <Select value={pageSize.toString()} onValueChange={(val) => setPageSize(parseInt(val))}>
                            <SelectTrigger className="h-9 w-18.75 bg-card/50 border-border/40 rounded-md focus:ring-primary/20 transition-all font-bold text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border min-w-18.75">
                                {[5,10, 20, 50].map(size => (
                                    <SelectItem key={size} value={size.toString()} className="text-xs font-bold">
                                        {size}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Navigation Buttons */}
                    <Pagination className="mx-0 w-auto">
                        <PaginationContent className="gap-1.5">
                            {/* First Page */}
                            <PaginationItem>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setCurrentPage(1)}
                                    disabled={currentPage === 1}
                                    className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-20"
                                >
                                    <ChevronsLeft className="h-4 w-4" />
                                </Button>
                            </PaginationItem>

                            {/* Previous Page */}
                            <PaginationItem>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-20"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                            </PaginationItem>
                            
                            {/* Page Numbers */}
                            <div className="hidden sm:flex items-center gap-1.5">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <PaginationItem key={page}>
                                        <Button
                                            variant={currentPage === page ? "default" : "ghost"}
                                            size="sm"
                                            onClick={() => setCurrentPage(page)}
                                            className={cn(
                                                "h-9 w-9 p-0 text-xs font-bold rounded-xl transition-all",
                                                currentPage === page 
                                                    ? "bg-primary text-white shadow-lg shadow-primary/30" 
                                                    : "hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20"
                                            )}
                                        >
                                            {page}
                                        </Button>
                                    </PaginationItem>
                                ))}
                            </div>

                            {/* Next Page */}
                            <PaginationItem>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-20"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </PaginationItem>

                            {/* Last Page */}
                            <PaginationItem>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setCurrentPage(totalPages)}
                                    disabled={currentPage === totalPages}
                                    className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-20"
                                >
                                    <ChevronsRight className="h-4 w-4" />
                                </Button>
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            </div>
        )}
      </div>

      {/* Dialogs */}
      <ProductDialog 
        open={isAddOpen || !!editingProduct} 
        onOpenChange={(open) => {
            if(!open) {
                setIsAddOpen(false);
                setEditingProduct(null);
            }
        }}
        product={editingProduct}
        onSave={handleSaveProduct}
      />

      <DeleteAlert 
        open={!!deletingProduct} 
        onOpenChange={(open) => !open && setDeletingProduct(null)} 
        itemName={deletingProduct?.name}
        onConfirm={handleDeleteProduct}
      />

      <AlertDialog open={isBulkDeleteOpen} onOpenChange={setIsBulkDeleteOpen}>
        <AlertDialogContent className="bg-card border-border shadow-2xl text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete Multiple Items?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete <span className="font-bold text-foreground">{selectedRows.size}</span> items? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-muted-foreground hover:bg-muted hover:text-foreground border-border bg-transparent">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkDelete}
              className="bg-red-600 text-white hover:bg-red-700 border-none shadow-sm"
            >
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      </div>
    </div>
  );
};

export default InventoryPage;
