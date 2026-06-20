import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({
  theme: "system",
  themeName: "blue",
  accentColor: "blue",
  setTheme: () => null,
  setThemeName: () => null,
  setAccentColor: () => null,
});

const themeNames = [
  { id: "blue", label: "Midnight Commerce", labelUr: "شام کا تجارت" },
  { id: "graphite", label: "Graphite Pro", labelUr: "گرافائٹ پرو" },
  { id: "slate", label: "Slate Pro", labelUr: "سلیٹ پرو" },
  { id: "emerald", label: "Emerald Cashier", labelUr: "زمرد کیشیر" },
  { id: "arctic", label: "Arctic POS", labelUr: "ارکٹک پوس" },
];

function applyTheme(themeName, themeMode) {
  const root = document.documentElement;
  root.setAttribute("data-theme", themeName);
  root.classList.remove("light", "dark");

  if (themeMode === "system") {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.add(isDark ? "dark" : "light");
  } else {
    root.classList.add(themeMode);
  }
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "depot-ui-theme",
  themeNameKey = "depot-ui-theme-name",
  accentKey = "depot-ui-accent-color",
}) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem(storageKey) || defaultTheme
  );
  const [themeName, setThemeName] = useState(
    () => localStorage.getItem(themeNameKey) || "blue"
  );
  const [accentColor, setAccentColorState] = useState(
    () => localStorage.getItem(accentKey) || "blue"
  );

  useEffect(() => {
    applyTheme(themeName, theme);
  }, [theme, themeName]);

  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme(themeName, "system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme, themeName]);

  const value = {
    theme,
    themeName,
    accentColor,
    themeNames,
    setTheme: (newTheme) => {
      localStorage.setItem(storageKey, newTheme);
      setTheme(newTheme);
    },
    setThemeName: (newName) => {
      localStorage.setItem(themeNameKey, newName);
      setThemeName(newName);
    },
    setAccentColor: (newColor) => {
      localStorage.setItem(accentKey, newColor);
      setAccentColorState(newColor);
    },
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};
