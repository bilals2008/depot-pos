// File: ogs-client/depot/src/context/SettingsContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

const SettingsContext = createContext();

const defaultSettings = {
  shopName: "Orion Orbit",
  shopAddress: "Shop #12, Market Area",
  shopPhone: "+92 300 1234567",
  shopEmail: "info@ogs.com",
  printerName: "",
  paperSize: "58mm",
  currencySymbol: "PKR",
  taxRate: "0",
  language: "en", // Default language
};

import { translations } from "@/lib/translations";

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("orion_settings");
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  // Handle RTL/LTR direction based on language
  useEffect(() => {
    const dir = settings.language === "ur" ? "rtl" : "ltr";
    document.documentElement.dir = dir;
    document.documentElement.lang = settings.language;
  }, [settings.language]);

  const updateSettings = (newSettings) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem("orion_settings", JSON.stringify(updated));
      return updated;
    });
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem("orion_settings");
    toast.success("Settings reset to default");
  };

  const t = (key) => {
    const lang = settings.language || "en";
    return translations[lang]?.[key] || key;
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings, t }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
