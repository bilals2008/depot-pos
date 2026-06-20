import { useSettings } from "@/context/SettingsContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  { id: "blue", label: "Default Blue", labelUr: "نیلا", desc: "Professional blue accent", color: "#2563eb" },
  { id: "ocean", label: "Ocean Teal", labelUr: "سمندری", desc: "Calm teal tones", color: "#0d9488" },
  { id: "emerald", label: "Emerald Green", labelUr: "سبز", desc: "Fresh green energy", color: "#059669" },
  { id: "amber", label: "Amber Warm", labelUr: "سنہری", desc: "Warm amber glow", color: "#d97706" },
  { id: "slate", label: "Slate Pro", labelUr: "سلیٹ", desc: "Dark elegant purple", color: "#7c3aed" },
];

const modeOptions = [
  { id: "light", icon: Sun, label: "Light" },
  { id: "dark", icon: Moon, label: "Dark" },
  { id: "system", icon: Monitor, label: "System" },
];

const SettingsPage = () => {
  const { settings, updateSettings, t } = useSettings();
  const { theme, themeName, setTheme, setThemeName } = useTheme();

  const handleSave = () => {
    toast.success("Settings saved");
  };

  return (
    <div className="h-full w-full overflow-y-auto">
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{t("Settings")}</h1>
          <p className="text-muted-foreground">Configure your shop preferences</p>
        </div>

        {/* Shop Profile */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-lg">{t("Shop Profile")}</CardTitle>
                <CardDescription>Shop information displayed on receipts</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shopName">{t("Shop Name")}</Label>
              <Input
                id="shopName"
                value={settings.shopName}
                onChange={(e) => updateSettings({ shopName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shopAddress">{t("Address")}</Label>
              <Input
                id="shopAddress"
                value={settings.shopAddress}
                onChange={(e) => updateSettings({ shopAddress: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shopPhone">{t("Phone")}</Label>
                <Input
                  id="shopPhone"
                  value={settings.shopPhone}
                  onChange={(e) => updateSettings({ shopPhone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shopEmail">{t("Email")}</Label>
                <Input
                  id="shopEmail"
                  value={settings.shopEmail}
                  onChange={(e) => updateSettings({ shopEmail: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cloud Sync */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Cloud className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-lg">Cloud Sync</CardTitle>
                <CardDescription>Sync data to Supabase cloud backup</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Cloud Sync</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically sync products, sales, and inventory to the cloud
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.syncEnabled}
                onClick={() => updateSettings({ syncEnabled: !settings.syncEnabled })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                  settings.syncEnabled ? "bg-primary" : "bg-input"
                }`}
              >
                <span
                  className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                    settings.syncEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Theme */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-lg">Theme</CardTitle>
                <CardDescription>Choose your application color scheme</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Color Themes */}
            <div>
              <Label className="mb-3 block">Color Theme</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {themes.map((th) => (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => setThemeName(th.id)}
                    className={`relative flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all hover:bg-accent ${
                      themeName === th.id
                        ? "border-primary bg-accent"
                        : "border-border"
                    }`}
                  >
                    <div
                      className="h-8 w-full rounded-md"
                      style={{ backgroundColor: th.color }}
                    />
                    <span className="text-xs font-medium text-center leading-tight">
                      {th.label}
                    </span>
                    {themeName === th.id && (
                      <Check className="absolute top-1 right-1 h-3.5 w-3.5 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Mode */}
            <div>
              <Label className="mb-3 block">Display Mode</Label>
              <div className="flex gap-2">
                {modeOptions.map((mode) => {
                  const Icon = mode.icon;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setTheme(mode.id)}
                      className={`flex items-center gap-2 rounded-lg border-2 px-4 py-2.5 transition-all hover:bg-accent ${
                        theme === mode.id
                          ? "border-primary bg-accent"
                          : "border-border"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{mode.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Language */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-lg">{t("Language")}</CardTitle>
                <CardDescription>{t("Select Language")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Select
              value={settings.language}
              onValueChange={(val) => updateSettings({ language: val })}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ur">اردو (Urdu)</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            {t("Save Changes")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;