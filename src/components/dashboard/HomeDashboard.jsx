// File: ogs-client/depot/src/components/dashboard/HomeDashboard.jsx
import {
  BarChart3,
  History,
  Package,
  Plus,
  RotateCcw,

  ShoppingCart
} from "lucide-react";
import ActionCard from "./ActionCard";

const HomeDashboard = ({ 
  onNavigate
}) => {
  const actionCards = [
    {
      id: "new-sale",
      icon: Plus,
      title: "New Sale",
      urduTitle: "نئی سیل",
      description: "Click here to sell items",
      variant: "success",
      size: "large",
      onClick: () => onNavigate?.("/sales"),
    },
    {
      id: "returns",
      icon: RotateCcw,
      title: "Returns",
      urduTitle: "واپسی",
      description: "Product return process",
      variant: "warning",
      size: "large",
      onClick: () => onNavigate?.("/returns"),
    },
    {
      id: "inventory",
      icon: Package,
      title: "Inventory",
      urduTitle: "سٹاک",
      description: "Manage your items",
      variant: "primary",
      size: "large",
      onClick: () => onNavigate?.("/inventory"),
    },
    {
      id: "sales-history",
      icon: History,
      title: "Sales History",
      urduTitle: "پرانی سیل",
      description: "View past receipts",
      variant: "orange",
      size: "large",
      onClick: () => onNavigate?.("/sales-history"),
    },
    {
      id: "reports",
      icon: BarChart3,
      title: "Reports",
      urduTitle: "حساب کتاب",
      description: "Daily & monthly sales",
      variant: "purple",
      size: "large",
      onClick: () => onNavigate?.("/reports"),
    },
    {
      id: "stock-history",
      icon: History,
      title: "Stock History",
      urduTitle: "سٹاک ریکارڈ",
      description: "Track stock changes",
      variant: "cyan",
      size: "large",
      onClick: () => onNavigate?.("/stock-history"),
    },

  ];

  return (
    <div className="h-full w-full bg-slate-50/80 dark:bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:px-8 space-y-6 sm:space-y-8 h-full flex flex-col justify-center">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight">
            Welcome to <span className="text-blue-600">Orion Orbit</span>
          </h1>
          <p className="text-lg text-muted-foreground font-medium">
            Please select what you want to do:
          </p>
        </div>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {actionCards.map((card) => (
            <ActionCard
              key={card.id}
              icon={card.icon}
              title={
                <div className="flex flex-col gap-0.5">
                  <span className="text-base sm:text-lg">{card.title}</span>
                  <span className="text-urdu text-xl sm:text-2xl font-normal mt-0.5 leading-none" dir="rtl">{card.urduTitle}</span>
                </div>
              }
              description={card.description}
              variant={card.variant}
              size={card.size}
              onClick={card.onClick}
              className={card.className}
            />
          ))}
        </div>

        {/* Support Section */}
        <div className="mt-4 p-4 rounded-2xl bg-white dark:bg-card border border-dashed border-blue-200 dark:border-border text-center shadow-sm">
          <p className="text-zinc-500 text-sm font-medium">
            Press <kbd className="px-2 py-0.5 bg-zinc-100 rounded border font-bold">F1</kbd> for New Sale
            <span className="mx-2">|</span>
            <span className="text-urdu text-lg">نئی سیل کے لیے F1 دبائیں</span>
          </p>
        </div>
      </div>

    </div>
  );
};

export default HomeDashboard;
