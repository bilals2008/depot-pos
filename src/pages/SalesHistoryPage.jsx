// File: ogs-client/depot/src/pages/SalesHistoryPage.jsx
import { useState, useEffect, useCallback } from "react";
import * as XLSX from "xlsx";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis
} from "@/components/ui/pagination";
import {
  Search,
  RotateCcw,
  Printer,
  FileSpreadsheet,
  FileText,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  Trash2,
  Eye
} from "lucide-react";
import { motion ,AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import ReceiptModal from "@/components/sales/ReceiptModal";

import { useSettings } from "@/context/SettingsContext";
import { useNavigation } from "@/context/NavigationContext";
import { cn, getPaginationRange } from "@/lib/utils";

const SalesHistoryPage = ({ onNavigate }) => {
  const { t } = useSettings();
  const { setParams } = useNavigation();
  // const { sales, deleteSale } = useSales(); // Refactored to manual fetch
  // We still need deleteSale, but maybe we should invoke it directly or keep context?
  // The context probably re-fetches everything. Let's use direct IPC for now to prove performance.
  // Actually, useSales might be listening to events. Let's check context later. For now, direct IPC.

  const [sales, setSales] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Sorting State
  const [sortColumn, setSortColumn] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(13);

  // Loading State
  const [isLoading, setIsLoading] = useState(true);

  // Bulk Selection State
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to page 1 on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch Data
  const fetchSales = useCallback(async () => {
    setIsLoading(true);
    try {
      // Use exposed electron API
      const result = await window.electron.getSalesPaginated({
        page: currentPage,
        pageSize,
        sortBy: sortColumn,
        sortOrder: sortDirection,
        searchTerm: debouncedSearch
      });
      setSales(result.sales);
      setTotalCount(result.totalCount);
    } catch (e) {
      console.error("Failed to fetch sales:", e);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, sortColumn, sortDirection, debouncedSearch]);

  useEffect(() => {
    fetchSales();

    // Use exposed electron API for listener
    // Note: preload.mjs exposes 'onSyncLog' which handles the subscription and returns unsubscription function
    // But check if it takes (event, msg) or just (msg).
    // Preload: const listener = (_event, value) => callback(value);
    // So callback receives 'value' (msg).

    let removeListener;
    if (window.electron && window.electron.onSyncLog) {
      removeListener = window.electron.onSyncLog((msg) => {
        if (msg && msg.includes('Synced')) {
          fetchSales();
        }
      });
    }

    return () => {
      if (removeListener) removeListener();
    };
  }, [fetchSales]);


  // Calculate pages
  const totalPages = Math.ceil(totalCount / pageSize);
  const paginatedSales = sales; // Already paginated from backend


  // Handlers
  const handleSort = (column) => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

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
    const currentPageIds = paginatedSales.map(s => s.id);
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
    setIsLoading(true);
    try {
      const ids = Array.from(selectedRows);
      for (const id of ids) {
        await window.electron.deleteSale(id);
      }
      toast.success(`${ids.length} sales deleted and stock reverted.`);
      setSelectedRows(new Set());
      setIsBulkDeleteOpen(false);
      fetchSales(); // Refresh
    } catch (e) {
      console.error("Bulk delete failed:", e);
      toast.error("Failed to delete some sales.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExcel = () => {
    const dataToExport = sales.map(sale => ({
      "Order ID": sale.id,
      "Date": new Date(sale.date).toLocaleDateString(),
      "Time": new Date(sale.date).toLocaleTimeString(),
      "Items": sale.items.map(i => `${i.name} (${i.quantity})`).join(", "),
      "Total Amount (PKR)": sale.total,
      "Status": sale.status
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales History");

    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `Sales_History_${dateStr}.xlsx`);
  };

  const handleViewStockHistory = (productName) => {
    setParams({ productFilter: productName });
    if (onNavigate) {
      onNavigate('/stock-history');
    }
  };

  const formatCurrency = (amount) => {
    return `Rs. ${amount.toLocaleString()}`;
  };

  return (
    <div className="flex flex-col h-full bg-background transition-colors duration-300 overflow-hidden">
      {/* Header Container */}
      <div className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center px-6 justify-between shrink-0">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-primary flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t("Sales History")}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleExportExcel}
            className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            {t("Export")}
          </Button>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("Search Order ID...")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 pl-9 bg-card border-border text-foreground placeholder:text-muted-foreground/50"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col gap-6 overflow-hidden">
        {/* Product Table Container */}
        <div className="border border-border rounded-lg bg-background shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">



          {/* Bulk Actions Bar */}
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
                      checked={paginatedSales.length > 0 && paginatedSales.every(s => selectedRows.has(s.id))}
                      onCheckedChange={toggleAll}
                      className="border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all"
                    />
                  </TableHead>
                  <TableHead
                    className="text-muted-foreground font-semibold cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort('id')}
                  >
                    <div className="flex items-center gap-2">
                      {t("Order ID")}
                      <ArrowUpDown className={cn(
                        "h-3.5 w-3.5 transition-colors",
                        sortColumn === 'id' ? "text-primary" : "text-muted-foreground/30"
                      )} />
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-muted-foreground font-semibold cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center gap-2">
                      {t("Date")}
                      <ArrowUpDown className={cn(
                        "h-3.5 w-3.5 transition-colors",
                        sortColumn === 'date' ? "text-primary" : "text-muted-foreground/30"
                      )} />
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-muted-foreground font-semibold cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort('items')}
                  >
                    <div className="flex items-center gap-2">
                      Items
                      <ArrowUpDown className={cn(
                        "h-3.5 w-3.5 transition-colors",
                        sortColumn === 'items' ? "text-primary" : "text-muted-foreground/30"
                      )} />
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-muted-foreground font-semibold cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort('total')}
                  >
                    <div className="flex items-center gap-2">
                      {t("Total")}
                      <ArrowUpDown className={cn(
                        "h-3.5 w-3.5 transition-colors",
                        sortColumn === 'total' ? "text-primary" : "text-muted-foreground/30"
                      )} />
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-muted-foreground font-semibold cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-2">
                      Status
                      <ArrowUpDown className={cn(
                        "h-3.5 w-3.5 transition-colors",
                        sortColumn === 'status' ? "text-primary" : "text-muted-foreground/30"
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
                      <TableCell className="pl-6"><Skeleton className="h-4 w-4" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell className="text-right pr-6"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : paginatedSales.length > 0 ? (
                  paginatedSales.map((sale) => (
                    <TableRow
                      key={sale.id}
                      className={cn(
                        "hover:bg-muted/50 border-b border-border/50 transition-colors group",
                        selectedRows.has(sale.id) && "bg-primary/5 hover:bg-primary/10"
                      )}
                    >
                      <TableCell className="pl-6">
                        <Checkbox
                          checked={selectedRows.has(sale.id)}
                          onCheckedChange={() => toggleRow(sale.id)}
                          className="border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all"
                        />
                      </TableCell>
                      <TableCell className="font-mono text-foreground font-bold py-4">
                        {sale.id}
                      </TableCell>
                      <TableCell className="text-foreground/80">
                        {new Date(sale.date).toLocaleDateString()}
                        <span className="text-muted-foreground text-xs ml-1">
                          {new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </TableCell>
                      <TableCell className="text-foreground/70 max-w-50 truncate">
                        {sale.items.map(i => i.name).join(", ")}
                      </TableCell>
                      <TableCell className="font-bold text-foreground">
                        {formatCurrency(sale.total)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`border-0 px-2.5 py-0.5 font-bold ${sale.status === "Completed"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-red-500/10 text-red-600 dark:text-red-400"
                            }`}
                        >
                          {sale.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-1">
                          {sale.items.length === 1 ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewStockHistory(sale.items[0].name)}
                              className="h-8 w-8 hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors"
                              title="View Stock History"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          ) : (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors"
                                  title="View Stock History"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-card border-border min-w-50 p-1 shadow-2xl">
                                <DropdownMenuLabel className="text-muted-foreground  ">
                                  Select Product
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-border/50" />
                                <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                                  {sale.items.map((item, idx) => (
                                    <DropdownMenuItem
                                      key={`${sale.id}-${idx}`}
                                      onClick={() => handleViewStockHistory(item.name)}
                                      className="rounded-md px-2 py-2 text-sm font-medium text-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors outline-none focus:bg-primary/10 focus:text-primary"
                                    >
                                      {item.name}
                                    </DropdownMenuItem>
                                  ))}
                                </div>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedReceipt(sale)}
                            className="h-8 w-8 hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors"
                            title="View Receipt"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (sale.status === "Returned" || sale.status === "Exchanged") return;
                              setParams({ orderId: sale.id });
                              onNavigate("/returns");
                            }}
                            disabled={sale.status === "Returned" || sale.status === "Exchanged"}
                            className="h-8 w-8 hover:bg-red-500/10 hover:text-red-600 text-muted-foreground disabled:opacity-20 transition-colors"
                            title="Process Return"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No orders found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Container */}
          {!isLoading && totalCount > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 shrink-0 border-t border-border bg-muted/50 backdrop-blur-sm">
              {/* Total Count (Left) */}
              <div className="text-sm text-muted-foreground font-medium font-sans">
                <span className="font-bold text-foreground/80">{totalCount}</span> total orders
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
                      {[13, 20, 50].map(size => (
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
                      {getPaginationRange(currentPage, totalPages).map((page, index) => (
                        page === "..." ? (
                          <PaginationItem key={`ellipsis-${index}`}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        ) : (
                          <PaginationItem key={page}>
                            <PaginationLink
                              isActive={currentPage === page}
                              onClick={() => setCurrentPage(page)}
                              className={cn(
                                "h-9 w-9 rounded-xl transition-all font-bold text-xs",
                                currentPage === page
                                  ? "bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary hover:text-white"
                                  : "hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20"
                              )}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        )
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
      </div>

      {/* Dialogs */}
      {selectedReceipt && (
        <ReceiptModal
          open={!!selectedReceipt}
          onOpenChange={(open) => !open && setSelectedReceipt(null)}
          order={selectedReceipt}
        />
      )}



      {/* Bulk Delete Confirmation */}
      <AlertDialog open={isBulkDeleteOpen} onOpenChange={setIsBulkDeleteOpen}>
        <AlertDialogContent className="bg-card border-border shadow-2xl text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete Multiple Orders?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete <span className="font-bold text-foreground">{selectedRows.size}</span> orders? This action cannot be undone.
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
  );
};

export default SalesHistoryPage;
