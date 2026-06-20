import { useMemo } from "react";
import { useSettings } from "@/context/SettingsContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Store,
  Cloud,
  Palette,
  Globe,
  Sun,
  Moon,
  Save,
  Check,
} from "lucide-react";

const themes = [
  {
    id: "blue", label: "Midnight Commerce", labelUr: "شام کا تجارت", desc: "Professional blue",
    light: { bg: "#f8fafc", card: "#ffffff", accent: "#3b82f6", text: "#020617", sidebar: "#0f172a" },
    dark: { bg: "#0a0e1a", card: "#111827", accent: "#3b82f6", text: "#f1f5f9", sidebar: "#0a0e1a" },
  },
  {
    id: "graphite", label: "Graphite Pro", labelUr: "گرافائٹ پرو", desc: "Modern graphite",
    light: { bg: "#f5f5f4", card: "#ffffff", accent: "#a3a3a3", text: "#1c1917", sidebar: "#27272a" },
    dark: { bg: "#09090b", card: "#18181b", accent: "#a3a3a3", text: "#fafafa", sidebar: "#09090b" },
  },
  {
    id: "slate", label: "Slate Pro", labelUr: "سلیٹ پرو", desc: "Purple elegance",
    light: { bg: "#f8fafc", card: "#ffffff", accent: "#7c3aed", text: "#020617", sidebar: "#1e1b4b" },
    dark: { bg: "#0c0a1d", card: "#18181b", accent: "#8b5cf6", text: "#e2e8f0", sidebar: "#0c0a1d" },
  },
  {
    id: "emerald", label: "Emerald Cashier", labelUr: "زمرد کیشیر", desc: "Fresh green",
    light: { bg: "#f0fdf4", card: "#ffffff", accent: "#10b981", text: "#022c22", sidebar: "#064e3b" },
    dark: { bg: "#022c22", card: "#064e3b", accent: "#34d399", text: "#ecfdf5", sidebar: "#022c22" },
  },
  {
    id: "arctic", label: "Arctic POS", labelUr: "ارکٹک پوس", desc: "Clean and minimal",
    light: { bg: "#ffffff", card: "#f9fafb", accent: "#3b82f6", text: "#111827", sidebar: "#111827" },
    dark: { bg: "#111827", card: "#1f2937", accent: "#60a5fa", text: "#f9fafb", sidebar: "#111827" },
  },
];

function MockupPreview({ colors }) {
  return (
    <div className="rounded-lg overflow-hidden border border-border/20">
      <div className="flex h-[72px]">
        <div className="w-8 flex flex-col items-center py-2 gap-1.5" style={{ backgroundColor: colors.sidebar }}>
          <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: colors.accent }} />
          <div className="h-1 w-1 rounded-sm" style={{ backgroundColor: colors.text, opacity: 0.2 }} />
          <div className="h-1 w-1 rounded-sm" style={{ backgroundColor: colors.text, opacity: 0.2 }} />
          <div className="h-1 w-1 rounded-sm" style={{ backgroundColor: colors.text, opacity: 0.2 }} />
        </div>
        <div className="flex-1 p-2 space-y-1.5" style={{ backgroundColor: colors.bg }}>
          <div className="flex items-center gap-1">
            <div className="h-1 w-12 rounded-sm" style={{ backgroundColor: colors.text, opacity: 0.15 }} />
            <div className="ml-auto h-1 w-1 rounded-full" style={{ backgroundColor: colors.text, opacity: 0.1 }} />
          </div>
          <div className="rounded-md p-1.5 space-y-1" style={{ backgroundColor: colors.card }}>
            <div className="flex items-center gap-1">
              <div className="h-1.5 w-1.5 rounded-sm" style={{ backgroundColor: colors.accent }} />
              <div className="h-1 flex-1 rounded-sm" style={{ backgroundColor: colors.text, opacity: 0.1 }} />
            </div>
            <div className="h-1 rounded-sm w-2/3" style={{ backgroundColor: colors.text, opacity: 0.06 }} />
            <div className="h-1 rounded-sm w-1/2" style={{ backgroundColor: colors.text, opacity: 0.06 }} />
          </div>
          <div className="rounded-md p-1.5 space-y-1" style={{ backgroundColor: colors.card }}>
            <div className="flex items-center gap-1">
              <div className="h-1.5 w-1.5 rounded-sm" style={{ backgroundColor: colors.accent, opacity: 0.5 }} />
              <div className="h-1 flex-1 rounded-sm" style={{ backgroundColor: colors.text, opacity: 0.08 }} />
            </div>
            <div className="h-1 rounded-sm w-3/4" style={{ backgroundColor: colors.text, opacity: 0.06 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

const SettingsPage = () => {
  const { settings, updateSettings, t } = useSettings();
  const { theme, themeName, setTheme, setThemeName } = useTheme();
  const isDark = useMemo(() => {
    if (theme === "dark") return true;
    if (theme === "system") return window.matchMedia("(prefers-color-scheme: dark)").matches;
    return false;
  }, [theme]);

  const handleSave = () => {
    toast.success("Settings saved");
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-background">
      <div className="w-full p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-foreground">{t("Settings")}</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your shop preferences and application appearance</p>
          </div>
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            {t("Save Changes")}
          </Button>
        </div>

        {/* Shop Profile */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          <div>
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Shop Profile</h2>
            </div>
            <p className="text-xs text-muted-foreground mt-1 ml-6">Basic information about your shop</p>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-x-8 gap-y-5">
            <div className="space-y-2">
              <Label htmlFor="shopName" className="text-sm text-foreground">{t("Shop Name")}</Label>
              <Input
                id="shopName"
                value={settings.shopName}
                onChange={(e) => updateSettings({ shopName: e.target.value })}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shopPhone" className="text-sm text-foreground">{t("Phone")}</Label>
              <Input
                id="shopPhone"
                value={settings.shopPhone}
                onChange={(e) => updateSettings({ shopPhone: e.target.value })}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shopAddress" className="text-sm text-foreground">{t("Address")}</Label>
              <Input
                id="shopAddress"
                value={settings.shopAddress}
                onChange={(e) => updateSettings({ shopAddress: e.target.value })}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shopEmail" className="text-sm text-foreground">{t("Email")}</Label>
              <Input
                id="shopEmail"
                value={settings.shopEmail}
                onChange={(e) => updateSettings({ shopEmail: e.target.value })}
                className="h-9 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          <div>
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Appearance</h2>
            </div>
            <p className="text-xs text-muted-foreground mt-1 ml-6">Customize the look and feel of the application</p>
          </div>
          <Separator />
          <div className="space-y-6">
            {/* Color Theme */}
            <div>
              <Label className="text-sm text-foreground mb-3 block">Color Theme</Label>
              <div className="flex gap-3">
                {themes.map((th) => {
                  const isSelected = themeName === th.id;
                  const c = isDark ? th.dark : th.light;
                  return (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => setThemeName(th.id)}
                      className={`relative w-[136px] shrink-0 rounded-lg overflow-hidden transition-all duration-200 text-left ${
                        isSelected
                          ? "ring-2 ring-primary ring-offset-2 ring-offset-card"
                          : "border border-border hover:border-muted-foreground/40"
                      }`}
                    >
                      <div className="p-1.5">
                        <MockupPreview colors={c} />
                      </div>
                      <div className="px-2.5 pb-2.5">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                            isSelected ? "border-primary bg-primary" : "border-muted-foreground/40"
                          }`}>
                            {isSelected && <Check className="h-2 w-2 text-primary-foreground" strokeWidth={3} />}
                          </div>
                          <span className={`text-[11px] font-medium leading-tight ${
                            isSelected ? "text-foreground" : "text-muted-foreground"
                          }`}>{th.label}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1 ml-5 leading-none">{th.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Display Mode */}
            <div>
              <Label className="text-sm text-foreground mb-3 block">Display Mode</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={`relative flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                    theme === "light"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <Sun className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-foreground">Light Mode</div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-snug">Use light theme for the application</p>
                  </div>
                  {theme === "light" && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />
                    </div>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={`relative flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                    theme === "dark"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <Moon className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-foreground">Dark Mode</div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-snug">Use dark theme for the application</p>
                  </div>
                  {theme === "dark" && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Language */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          <div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Language</h2>
            </div>
            <p className="text-xs text-muted-foreground mt-1 ml-6">Select your preferred language</p>
          </div>
          <Separator />
          <div className="flex items-center gap-4">
            <Label className="text-sm text-foreground shrink-0">{t("Select Language")}</Label>
            <Select
              value={settings.language}
              onValueChange={(val) => updateSettings({ language: val })}
            >
              <SelectTrigger className="w-44 h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ur">اردو (Urdu)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Cloud Sync */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          <div>
            <div className="flex items-center gap-2">
              <Cloud className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Cloud Sync</h2>
            </div>
            <p className="text-xs text-muted-foreground mt-1 ml-6">Sync data to Supabase cloud backup</p>
          </div>
          <Separator />
          <div className="flex items-center justify-between py-1">
            <div className="space-y-1">
              <Label className="text-sm text-foreground">Enable Cloud Sync</Label>
              <p className="text-xs text-muted-foreground">
                Automatically sync products, sales, and inventory to the cloud
              </p>
            </div>
            <Toggle
              checked={settings.syncEnabled}
              onChange={() => updateSettings({ syncEnabled: !settings.syncEnabled })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
        checked ? "bg-primary" : "bg-input"
      }`}
    >
      <span
        className={`pointer-events-none block h-3.5 w-3.5 rounded-full bg-background shadow ring-0 transition-transform ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default SettingsPage;
