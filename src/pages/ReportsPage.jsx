// File: ogs-client/depot/src/pages/ReportsPage.jsx
import { useState, useMemo, useEffect } from "react";
import {
  DollarSign,
  ShoppingBag,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  CreditCard,
  Calendar as CalendarIcon,
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useReports } from "@/hooks/useReports"; // Import new hook

const ReportsPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");

  // Use new Reports Hook
  const { sales, loading, fetchDailySales } = useReports();

  // Fetch data when date changes
  useEffect(() => {
    fetchDailySales(selectedDate);
  }, [selectedDate, fetchDailySales]);

  const dailyStats = useMemo(() => {
    // Sales are already filtered by backend for the selected date
    if (!sales || sales.length === 0) {
      return { revenue: 0, orderCount: 0, avgValue: 0, orders: [] };
    }

    const revenue = sales.reduce((sum, sale) => sum + (Number(sale.total) || 0), 0);
    const avgValue = sales.length > 0 ? revenue / sales.length : 0;

    return {
      revenue,
      orderCount: sales.length,
      avgValue,
      orders: sales // Already sorted desc by backend usually, but logic below ensures sorting if needed
    };
  }, [sales]);

  const filteredOrders = useMemo(() => {
    if (!dailyStats.orders) return [];
    if (!searchQuery.trim()) return dailyStats.orders;
    return dailyStats.orders.filter(order =>
      order.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [dailyStats.orders, searchQuery]);

  const formatCurrency = (val) => new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);
  const formatTime = (dateString) => new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const goToPrevDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
  };

  const goToNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
  };

  return (
    <div className="flex flex-col h-full w-full bg-background p-4 overflow-hidden font-outfit" style={{ fontFamily: 'Outfit, sans-serif' }}>

      {/* Header - Compact & Clean */}
      <div className="flex items-center justify-between mb-3 shrink-0 px-1">
        <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Daily Reports
        </h1>

        {/* Date Controls */}
        <div className="flex items-center gap-1 bg-background rounded-lg border border-zinc-200 dark:border-border/40 p-0.5 shadow-sm">
          <Button variant="ghost" size="icon" onClick={goToPrevDay} className="h-7 w-7 rounded-sm hover:bg-muted text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <button
                className="px-3 py-1 text-xs font-semibold hover:bg-muted rounded-sm transition-colors min-w-30 text-center flex items-center justify-center gap-2 text-foreground"
              >
                <CalendarIcon className="h-3.5 w-3.5 opacity-70" />
                {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
                className="p-3 shadow-none border-0 [&_td]:w-9 [&_td]:h-9 [&_th]:w-9 [&_button]:w-8 [&_button]:h-8 [&_button]:text-xs [&_button]:font-medium"
              />
            </PopoverContent>
          </Popover>

          <Button variant="ghost" size="icon" onClick={goToNextDay} className="h-7 w-7 rounded-sm hover:bg-muted text-muted-foreground hover:text-foreground">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content Container - Unified Style */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">

        {/* Stats Grid - Flat & Clean */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
          <div className="bg-card border border-zinc-200 dark:border-border/40 rounded-xl p-4 shadow-sm flex items-center justify-between group hover:border-zinc-300 dark:hover:border-border/60 transition-colors">
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Revenue</p>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 tracking-tight">
                {loading ? "..." : formatCurrency(dailyStats.revenue)}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-card border border-zinc-200 dark:border-border/40 rounded-xl p-4 shadow-sm flex items-center justify-between group hover:border-zinc-300 dark:hover:border-border/60 transition-colors">
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Orders</p>
              <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1 tracking-tight">
                {loading ? "..." : dailyStats.orderCount}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-card border border-zinc-200 dark:border-border/40 rounded-xl p-4 shadow-sm flex items-center justify-between group hover:border-zinc-300 dark:hover:border-border/60 transition-colors">
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Avg. Value</p>
              <p className="text-2xl font-black text-violet-600 dark:text-violet-400 mt-1 tracking-tight">
                {loading ? "..." : formatCurrency(dailyStats.avgValue)}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-400">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Transactions Table - Unified Container */}
        <div className="flex-1 bg-background border border-zinc-200 dark:border-border/40 rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="px-5 py-3 border-b border-border/40 flex items-center justify-between bg-background">
            <h3 className="text-sm font-bold flex items-center gap-2 text-foreground">
              <TrendingUp className="h-4 w-4 text-primary" />
              Transaction History
            </h3>
            <div className="flex items-center gap-3">
              <div className="relative w-48 md:w-56">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search Order ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 w-full bg-muted/40 border-border/40 text-xs"
                />
              </div>
              <span className="text-[10px] font-medium text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full border border-border/20">
                {dailyStats.orders.length} Records
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="flex h-full items-center justify-center text-muted-foreground text-sm">Loading data...</div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/80 sticky top-0 z-10 backdrop-blur-md">
                  <TableRow className="border-b border-border/40 hover:bg-transparent">
                    <TableHead className="h-8 py-0 text-[11px] uppercase tracking-wider font-bold text-muted-foreground w-30">Order ID</TableHead>
                    <TableHead className="h-8 py-0 text-[11px] uppercase tracking-wider font-bold text-muted-foreground">Time</TableHead>
                    <TableHead className="h-8 py-0 text-[11px] uppercase tracking-wider font-bold text-muted-foreground text-right pr-6">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id} className="border-b border-border/40 hover:bg-muted/30 transition-colors h-9">
                        <TableCell className="py-0 font-mono text-xs font-medium text-primary">
                          {order.id}
                        </TableCell>
                        <TableCell className="py-0 text-xs text-muted-foreground">
                          {formatTime(order.date)}
                        </TableCell>
                        <TableCell className="py-0 text-right font-bold text-foreground text-xs pr-6">
                          {formatCurrency(order.total)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-40 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground opacity-50">
                          <ShoppingBag className="h-8 w-8 mb-2 stroke-[1.5]" />
                          <p className="text-xs font-medium">No transactions found for this date</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
