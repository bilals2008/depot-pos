// File: ogs-client/depot/src/pages/StockHistoryPage.jsx
import { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  History,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { stockHistoryLogs as initialLogs } from "@/data/stockHistoryData"; // Removed Mock Data
import { useSettings } from "@/context/SettingsContext";
import { useNavigation } from "@/context/NavigationContext";
import { cn, getPaginationRange } from "@/lib/utils";
import { useStockHistory } from "@/hooks/useStockHistory"; // Import new hook

const StockHistoryPage = ({ onNavigate }) => {
  const { t } = useSettings();
  const { navParams, clearParams, popHistory } = useNavigation();

  // Use Hook
  const { logs, loading: hookLoading, fetchStockHistory } = useStockHistory();

  const [searchQuery, setSearchQuery] = useState("");
  // const [isLoading, setIsLoading] = useState(true); // Replaced by hookLoading

  // Sorting State
  const [sortColumn, setSortColumn] = useState("timestamp");
  const [sortDirection, setSortDirection] = useState("desc");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  useEffect(() => {
    // Refresh logs from data source on mount
    fetchStockHistory();


    // Check for navigation parameters
    if (navParams.productFilter) {
      setTimeout(() => {
        setSearchQuery(navParams.productFilter);
        clearParams();
      }, 0);
    }

    // const timer = setTimeout(() => setIsLoading(false), 1000); // Removed
    // return () => clearTimeout(timer); // Removed
  }, [navParams, clearParams, fetchStockHistory]);

  const filteredLogs = useMemo(() => {
    let result = logs.filter(log =>
      (log.productName || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortColumn && sortDirection) {
      result = [...result].sort((a, b) => {
        let valA = a[sortColumn];
        let valB = b[sortColumn];

        if (sortColumn === 'previousStock' || sortColumn === 'currentStock' || sortColumn === 'change' || sortColumn === 'timestamp') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }

        valA = String(valA).toLowerCase();
        valB = String(valB).toLowerCase();

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [logs, searchQuery, sortColumn, sortDirection]);

  // Reset to first page when filtering/sorting changes
  useEffect(() => {
    setTimeout(() => setCurrentPage(1), 0);
  }, [searchQuery, sortColumn, sortDirection, pageSize]);

  const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1;
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

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

  return (
    <div className="flex flex-col h-full bg-background transition-colors duration-300 overflow-hidden">
      {/* Header Container (matching InventoryPage) */}
      <div className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center px-6 justify-between shrink-0 font-sans">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              const prev = popHistory();
              if (onNavigate) onNavigate(prev);
            }}
            className="h-8 w-8 hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors"
            title="Go Back"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold text-primary flex items-center gap-2 tracking-tight">
            <History className="h-5 w-5" />
            Stock Audit History
          </h1>
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col gap-6 overflow-hidden">

        {/* Control Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("Search by product name...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-9 bg-card border-border text-foreground placeholder:text-muted-foreground/50"
              />
            </div>
          </div>
        </div>

        {/* Log Table Container */}
        <div className="border border-border rounded-lg bg-background shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader className="bg-muted/80 sticky top-0 z-10 backdrop-blur-md">
                <TableRow className="hover:bg-transparent border-b border-border">
                  <TableHead
                    className="text-muted-foreground font-semibold cursor-pointer hover:bg-muted/50 transition-colors pl-6"
                    onClick={() => handleSort('timestamp')}
                  >
                    <div className="flex items-center gap-2">
                      Date & Time
                      <ArrowUpDown className={cn(
                        "h-3.5 w-3.5 transition-colors",
                        sortColumn === 'timestamp' ? "text-primary" : "text-muted-foreground/30"
                      )} />
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-muted-foreground font-semibold cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort('productName')}
                  >
                    <div className="flex items-center gap-2">
                      Product Name
                      <ArrowUpDown className={cn(
                        "h-3.5 w-3.5 transition-colors",
                        sortColumn === 'productName' ? "text-primary" : "text-muted-foreground/30"
                      )} />
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-muted-foreground font-semibold cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort('previousStock')}
                  >
                    <div className="flex items-center gap-2">
                      Previous Stock
                      <ArrowUpDown className={cn(
                        "h-3.5 w-3.5 transition-colors",
                        sortColumn === 'previousStock' ? "text-primary" : "text-muted-foreground/30"
                      )} />
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-muted-foreground font-semibold cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort('currentStock')}
                  >
                    <div className="flex items-center gap-2">
                      New Stock
                      <ArrowUpDown className={cn(
                        "h-3.5 w-3.5 transition-colors",
                        sortColumn === 'currentStock' ? "text-primary" : "text-muted-foreground/30"
                      )} />
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-muted-foreground font-semibold cursor-pointer hover:bg-muted/50 transition-colors pr-6"
                    onClick={() => handleSort('change')}
                  >
                    <div className="flex items-center gap-2 justify-end">
                      Adjustment
                      <ArrowUpDown className={cn(
                        "h-3.5 w-3.5 transition-colors",
                        sortColumn === 'change' ? "text-primary" : "text-muted-foreground/30"
                      )} />
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hookLoading ? (
                  Array.from({ length: pageSize }).map((_, idx) => (
                    <TableRow key={`skeleton-${idx}`} className="border-b border-border/50">
                      <TableCell className="py-4 pl-6"><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell className="text-right pr-6"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : paginatedLogs.length > 0 ? (
                  paginatedLogs.map((log) => (
                    <TableRow
                      key={log.id}
                      className="hover:bg-muted/50 border-b border-border/50 transition-colors group"
                    >
                      <TableCell className="py-4 pl-6 text-muted-foreground text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 opacity-50" />
                          {new Date(log.timestamp).toLocaleDateString()}
                          <span className="text-xs opacity-70">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-foreground/90">
                        {log.productName}
                      </TableCell>
                      <TableCell className="text-muted-foreground font-medium">
                        {log.previousStock} Units
                      </TableCell>
                      <TableCell className="text-foreground/80 font-medium">
                        {log.currentStock} Units
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Badge
                          variant="outline"
                          className={cn(
                            "border-0 px-2.5 py-0.5 font-bold inline-flex items-center gap-1",
                            log.change > 0
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-red-500/10 text-red-600 dark:text-red-400"
                          )}
                        >
                          {log.change > 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {log.change > 0 ? `+${log.change}` : log.change}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <History className="h-8 w-8 opacity-20" />
                        <p>No stock history logs found.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Container (Inside Table Border) - Matching InventoryPage */}
          {!hookLoading && filteredLogs.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 shrink-0 border-t border-border bg-muted/50 backdrop-blur-sm">
              {/* Total Count (Left) */}
              <div className="text-sm text-muted-foreground font-medium font-sans">
                <span className="font-bold text-foreground/80">{filteredLogs.length}</span> total logs
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
                      {[12, 15, 20, 50].map(size => (
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
    </div>
  );
};

export default StockHistoryPage;
