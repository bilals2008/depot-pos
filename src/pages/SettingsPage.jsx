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
  Monitor,
  Save,
  Check,
} from "lucide-react";

const themes = [
  { id: "blue", label: "Default Blue", labelUr: "نیلا", desc: "Professional blue", light: { bg: "#f8fafc", card: "#ffffff", accent: "#2563eb", text: "#020617" }, dark: { bg: "#000000", card: "#0f172a", accent: "#1d4ed8", text: "#ffffff" } },
  { id: "slate", label: "Slate Pro", labelUr: "سلیٹ", desc: "Purple elegance", light: { bg: "#f8fafc", card: "#ffffff", accent: "#7c3aed", text: "#020617" }, dark: { bg: "#09090b", card: "#18181b", accent: "#8b5cf6", text: "#e2e8f0" } },
];

const modeOptions = [
  { id: "light", icon: Sun, label: "Light" },
  { id: "dark", icon: Moon, label: "Dark" },
  { id: "system", icon: Monitor, label: "System" },
];

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
    <div className="h-full w-full overflow-y-auto bg-muted/30">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-sm font-semibold text-foreground">{t("Settings")}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Configure your shop preferences</p>
          </div>
          <Button onClick={handleSave} size="sm" className="gap-1.5 text-xs h-8">
            <Save className="h-3.5 w-3.5" />
            {t("Save Changes")}
          </Button>
        </div>

        {/* Shop Profile */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-5">
          <div className="flex items-center gap-2">
            <Store className="h-4 w-4 text-primary" />
            <h2 className="text-xs font-semibold text-foreground">Shop Profile</h2>
          </div>
          <Separator />
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="shopName" className="text-xs font-medium">{t("Shop Name")}</Label>
              <Input
                id="shopName"
                value={settings.shopName}
                onChange={(e) => updateSettings({ shopName: e.target.value })}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="shopAddress" className="text-xs font-medium">{t("Address")}</Label>
              <Input
                id="shopAddress"
                value={settings.shopAddress}
                onChange={(e) => updateSettings({ shopAddress: e.target.value })}
                className="h-8 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="shopPhone" className="text-xs font-medium">{t("Phone")}</Label>
                <Input
                  id="shopPhone"
                  value={settings.shopPhone}
                  onChange={(e) => updateSettings({ shopPhone: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="shopEmail" className="text-xs font-medium">{t("Email")}</Label>
                <Input
                  id="shopEmail"
                  value={settings.shopEmail}
                  onChange={(e) => updateSettings({ shopEmail: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-5">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" />
            <h2 className="text-xs font-semibold text-foreground">Appearance</h2>
          </div>
          <Separator />
          <div className="space-y-5">
            {/* Color Themes */}
            <div>
              <Label className="text-xs font-medium mb-3 block">Color Theme</Label>
              <div className="flex gap-3">
                {themes.map((th) => {
                  const isSelected = themeName === th.id;
                  const c = isDark ? th.dark : th.light;
                  return (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => setThemeName(th.id)}
                      className={`group flex flex-col items-center gap-1.5 transition-all ${
                        isSelected ? "" : "opacity-60 hover:opacity-90"
                      }`}
                    >
                      <div className={`relative rounded-full p-0.5 transition-all ${
                        isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
                      }`}>
                        <div className="h-6 w-6 rounded-full" style={{ backgroundColor: c.accent }} />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`text-[10px] font-medium whitespace-nowrap ${
                          isSelected ? "text-foreground" : "text-muted-foreground"
                        }`}>{th.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Display Mode */}
            <div>
              <Label className="text-xs font-medium mb-3 block">Display Mode</Label>
              <div className="flex gap-1.5 p-1 bg-muted rounded-lg w-fit">
                {modeOptions.map((mode) => {
                  const Icon = mode.icon;
                  const isActive = theme === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setTheme(mode.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        isActive
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {mode.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Language */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-5">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            <h2 className="text-xs font-semibold text-foreground">Language</h2>
          </div>
          <Separator />
          <div className="flex items-center gap-3">
            <Label className="text-xs font-medium shrink-0">{t("Select Language")}</Label>
            <Select
              value={settings.language}
              onValueChange={(val) => updateSettings({ language: val })}
            >
              <SelectTrigger className="w-44 h-8 text-sm">
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
        <div className="bg-card border border-border rounded-xl p-5 space-y-5">
          <div className="flex items-center gap-2">
            <Cloud className="h-4 w-4 text-primary" />
            <h2 className="text-xs font-semibold text-foreground">Cloud Sync</h2>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-xs font-medium">Enable Cloud Sync</Label>
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

export default SettingsPage;
