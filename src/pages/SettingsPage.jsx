import { useState, useEffect, useRef, useCallback } from "react";
import { useSettings } from "@/context/SettingsContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Store,
  Palette,
  Globe,
  Printer,
  Cloud,
  Settings2,
  Check,
  Save,
  Info,
} from "lucide-react";

const tabs = [
  { id: "shop", label: "Shop Profile", icon: Store },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "language", label: "Language", icon: Globe },
  { id: "printer", label: "Printer & Receipts", icon: Printer },
  { id: "cloud", label: "Cloud Sync", icon: Cloud },
];

const themeGroups = [
  {
    label: "Light",
    themes: [
      { id: "blue", label: "Midnight Commerce", desc: "Professional blue", bg: "#f8fafc", card: "#ffffff", accent: "#3b82f6", text: "#020617" },
      { id: "graphite", label: "Graphite Pro", desc: "Modern graphite", bg: "#f5f5f4", card: "#ffffff", accent: "#a3a3a3", text: "#1c1917" },
      { id: "emerald", label: "Emerald Cashier", desc: "Fresh green", bg: "#f0fdf4", card: "#ffffff", accent: "#10b981", text: "#022c22" },
    ],
  },
  {
    label: "Dark",
    themes: [
      { id: "blue-dark", label: "Midnight Commerce", desc: "Professional blue", bg: "#0a0e1a", card: "#111827", accent: "#3b82f6", text: "#f1f5f9" },
      { id: "graphite-dark", label: "Graphite Pro", desc: "Modern graphite", bg: "#09090b", card: "#18181b", accent: "#a3a3a3", text: "#fafafa" },
      { id: "slate-dark", label: "Slate Pro", desc: "Purple elegance", bg: "#0c0a1d", card: "#18181b", accent: "#8b5cf6", text: "#e2e8f0" },
      { id: "emerald-dark", label: "Emerald Cashier", desc: "Fresh green", bg: "#022c22", card: "#064e3b", accent: "#34d399", text: "#ecfdf5" },
      { id: "arctic-dark", label: "Arctic POS", desc: "Clean and minimal", bg: "#111827", card: "#1f2937", accent: "#60a5fa", text: "#f9fafb" },
    ],
  },
];

const SettingsPage = () => {
  const { settings, updateSettings, t } = useSettings();
  const { theme, themeName, setTheme, setThemeName } = useTheme();
  const [activeTab, setActiveTab] = useState("shop");
  const [dirty, setDirty] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        setDirty(false);
        toast.success(t("Settings saved"));
      }
      if (e.key === "Escape") {
        document.activeElement?.blur();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [t]);

  const handleUpdate = useCallback((patch) => {
    updateSettings(patch);
    setDirty(true);
  }, [updateSettings]);

  const handleSave = useCallback(() => {
    setDirty(false);
    toast.success(t("Settings saved"));
  }, [t]);

  const handleNavKeyDown = useCallback((e) => {
    const items = navRef.current?.querySelectorAll("[data-tab-id]");
    if (!items?.length) return;
    const currentIndex = Array.from(items).findIndex((el) => el.getAttribute("data-tab-id") === activeTab);
    let nextIndex = currentIndex;
    if (e.key === "ArrowDown") nextIndex = Math.min(currentIndex + 1, items.length - 1);
    else if (e.key === "ArrowUp") nextIndex = Math.max(currentIndex - 1, 0);
    else return;
    e.preventDefault();
    const nextId = items[nextIndex].getAttribute("data-tab-id");
    if (nextId) { setActiveTab(nextId); items[nextIndex].focus(); }
  }, [activeTab]);

  const resolveThemeId = (gt) => {
    const map = { "blue": "blue", "graphite": "graphite", "emerald": "emerald", "blue-dark": "blue", "graphite-dark": "graphite", "slate-dark": "slate", "emerald-dark": "emerald", "arctic-dark": "arctic" };
    return map[gt.id] || gt.id;
  };

  const isThemeSelected = (gt) => {
    const resolved = resolveThemeId(gt);
    const isDark = gt.id.endsWith("-dark");
    const currentMode = theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      : theme;
    return themeName === resolved && currentMode === (isDark ? "dark" : "light");
  };

  const handleThemeSelect = (gt) => {
    setThemeName(resolveThemeId(gt));
    setTheme(gt.id.endsWith("-dark") ? "dark" : "light");
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "shop":
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-semibold text-foreground">{t("Shop Profile")}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Basic information about your shop</p>
            </div>
            <Card>
              <CardContent className="p-5">
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="shopName" className="text-sm text-foreground">{t("Shop Name")}</Label>
                    <Input id="shopName" value={settings.shopName} onChange={(e) => handleUpdate({ shopName: e.target.value })} className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="shopPhone" className="text-sm text-foreground">{t("Phone")}</Label>
                    <Input id="shopPhone" value={settings.shopPhone} onChange={(e) => handleUpdate({ shopPhone: e.target.value })} className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="shopAddress" className="text-sm text-foreground">{t("Address")}</Label>
                    <Input id="shopAddress" value={settings.shopAddress} onChange={(e) => handleUpdate({ shopAddress: e.target.value })} className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="shopEmail" className="text-sm text-foreground">{t("Email")}</Label>
                    <Input id="shopEmail" value={settings.shopEmail} onChange={(e) => handleUpdate({ shopEmail: e.target.value })} className="h-9 text-sm" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "appearance":
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-semibold text-foreground">Appearance</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Customize the look and feel</p>
            </div>
            <Card>
              <CardContent className="p-5">
                <div className="space-y-5">
                  {themeGroups.map((group) => (
                    <div key={group.label}>
                      <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">{group.label}</p>
                      <div className="grid grid-cols-3 gap-3">
                        {group.themes.map((t) => {
                          const selected = isThemeSelected(t);
                          return (
                            <button
                              key={t.id}
                              onClick={() => handleThemeSelect(t)}
                              className={cn(
                                "group relative rounded-xl border-2 p-4 text-left transition-all cursor-pointer",
                                selected ? "border-primary shadow-sm" : "border-border hover:border-muted-foreground/30"
                              )}
                            >
                              {selected && (
                                <div className="absolute top-3 right-3 flex items-center justify-center size-5 rounded-full bg-primary">
                                  <Check size={12} className="text-primary-foreground" />
                                </div>
                              )}
                              <div className="rounded-lg border overflow-hidden mb-3" style={{ borderColor: t.card }}>
                                <div style={{ background: t.bg, padding: "12px" }}>
                                  <div className="h-2 w-16 rounded-full mb-2" style={{ background: t.accent }} />
                                  <div className="h-1.5 w-24 rounded-full mb-1.5 opacity-40" style={{ background: t.text }} />
                                  <div className="rounded p-2 flex gap-1.5" style={{ background: t.card }}>
                                    <div className="h-1.5 w-1.5 rounded-full" style={{ background: t.accent }} />
                                    <div className="h-1.5 w-1.5 rounded-full" style={{ background: t.accent, opacity: 0.3 }} />
                                    <div className="h-1.5 w-1.5 rounded-full" style={{ background: t.text, opacity: 0.3 }} />
                                  </div>
                                </div>
                              </div>
                              <p className="text-sm font-medium text-foreground">{t.label}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{t.desc}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "language":
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-semibold text-foreground">{t("Language")}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Select your preferred language</p>
            </div>
            <Card>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-4">
                  <Label className="text-sm text-foreground shrink-0">{t("Select Language")}</Label>
                  <Select value={settings.language} onValueChange={(val) => handleUpdate({ language: val })}>
                    <SelectTrigger className="w-44 h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ur">اردو (Urdu)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="bg-muted/50 rounded-lg p-4 border border-border">
                  <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                  <p className="text-sm text-foreground">
                    {settings.language === "ur"
                      ? "یہ ایک نمونہ متن ہے۔ اسٹور کا نام اور دیگر معلومات اردو میں دکھائی جائیں گی۔"
                      : "This is a preview. Shop name and other information will be displayed in the selected language."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "printer":
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-semibold text-foreground">{t("Printer & Receipts")}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Configure receipt printing and currency</p>
            </div>
            <Card>
              <CardContent className="p-5">
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="printerName" className="text-sm text-foreground">Printer Name</Label>
                    <Input id="printerName" value={settings.printerName} onChange={(e) => handleUpdate({ printerName: e.target.value })} placeholder="e.g. EPSON TM-T20" className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="paperSize" className="text-sm text-foreground">Paper Size</Label>
                    <Select value={settings.paperSize} onValueChange={(val) => handleUpdate({ paperSize: val })}>
                      <SelectTrigger id="paperSize" className="h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="58mm">58mm</SelectItem>
                        <SelectItem value="80mm">80mm</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="currencySymbol" className="text-sm text-foreground">Currency Symbol</Label>
                    <Input id="currencySymbol" value={settings.currencySymbol} onChange={(e) => handleUpdate({ currencySymbol: e.target.value })} placeholder="e.g. PKR" className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="taxRate" className="text-sm text-foreground">Tax Rate (%)</Label>
                    <Input id="taxRate" type="number" value={settings.taxRate} onChange={(e) => handleUpdate({ taxRate: e.target.value })} min="0" max="100" className="h-9 text-sm" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "cloud":
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-semibold text-foreground">Cloud Sync</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Sync data to Supabase cloud backup</p>
            </div>
            <Card>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between py-1">
                  <div className="space-y-0.5">
                    <Label className="text-sm text-foreground">Enable Cloud Sync</Label>
                    <p className="text-xs text-muted-foreground">Automatically sync products, sales, and inventory to the cloud</p>
                  </div>
                  <Switch checked={settings.syncEnabled} onCheckedChange={(val) => handleUpdate({ syncEnabled: val })} />
                </div>
                <Separator />
                <div className="bg-muted/50 rounded-lg p-4 border border-border">
                  <div className="flex items-start gap-3">
                    <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-foreground font-medium">Connection Status</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {settings.syncEnabled
                          ? "Sync is enabled. Data will be synchronized automatically every 2 minutes."
                          : "Sync is disabled. Enable it to back up your data to the cloud."}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
      <div className="flex flex-col h-full bg-background">
        <div className="h-12 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <Settings2 className="h-5 w-5 text-primary" />
            <h1 className="text-base font-bold text-foreground tracking-tight">{t("Settings")}</h1>
            {dirty && (
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground ml-2">
                <span className="size-1.5 rounded-full bg-amber-500" />
                Unsaved
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              Ctrl+S
            </kbd>
            <Button onClick={handleSave} size="sm" className="gap-2" disabled={!dirty}>
              <Save className="h-4 w-4" />
              {t("Save Changes")}
            </Button>
          </div>
        </div>
      <div className="flex flex-1 min-h-0">
        <nav ref={navRef} onKeyDown={handleNavKeyDown} className="w-52 shrink-0 border-r border-border pt-4 px-2 space-y-0.5">
          {tabs.map((tab, i) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                data-tab-id={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left transition-all cursor-pointer group",
                  isActive
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                <tab.icon className={cn("h-4 w-4 shrink-0", isActive && "text-primary")} />
                <span className="flex-1 truncate">{tab.label}</span>
                <kbd className="opacity-0 group-hover:opacity-40 transition-opacity text-[10px] font-mono text-muted-foreground">
                  F{i + 1}
                </kbd>
              </button>
            );
          })}
        </nav>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl">
            {renderTabContent()}
          </div>
        </div>
      </div>
      </div>
  );
};

export default SettingsPage;
