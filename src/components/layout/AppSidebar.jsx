// File: ogs-client/depot/src/components/layout/AppSidebar.jsx
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTheme } from "@/context/ThemeContext";
import { BarChart3, FileText, History, Home, LayoutDashboard, LogOut, Moon, Package, RotateCcw, Settings, ShoppingCart, Sun } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import SyncStatus from "../SyncStatus";

const AppSidebar = ({ activePath, onNavigate }) => {
  const { theme, setTheme } = useTheme();
  const { t } = useSettings();

  const navItems = [
    { icon: LayoutDashboard, label: t("Dashboard"), path: "/" },
    // POS Trigger
    { icon: ShoppingCart, label: t("New Sale"), path: "/sales" }, 
    { icon: Package, label: t("Inventory"), path: "/inventory" },
    { icon: RotateCcw, label: t("Returns"), path: "/returns" },
    { icon: FileText, label: t("Sales History"), path: "/sales-history" },
    { icon: History, label: t("Stock History"), path: "/stock-history" },
    { icon: BarChart3, label: t("Reports"), path: "/reports" },
    { icon: Settings, label: t("Settings"), path: "/settings" },
  ];

  return (
    <aside className="flex flex-col h-screen w-18 bg-background border-r border-border z-50">
      <div className="flex items-center justify-center h-16 border-b border-border">
        <img src="/logo-white.png" alt="Orion Orbit" className="h-10 w-10 object-contain dark:invert-0 invert" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col items-center py-4 gap-2">
        <TooltipProvider delayDuration={0}>
          {navItems.map((item, index) => {
            const isActive = item.path ? activePath === item.path : false;
            return (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-11 w-11 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                    onClick={() => item.action ? item.action() : onNavigate(item.path)}
                  >
                    <item.icon className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </nav>

      {/* Sync Status */}
      <div className=" border-t border-border flex justify-center items-center">
          <SyncStatus />
      </div>

      {/* Theme Toggle */}
      <div className="p-3 border-t-0 border-border">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-11 w-11 rounded-xl"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
    </aside>
  );
};

export default AppSidebar;
