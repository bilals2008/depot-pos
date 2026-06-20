import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({
  theme: "system",
  themeName: "blue",
  setTheme: () => null,
  setThemeName: () => null,
});

const themeNames = [
  { id: "blue", label: "Default Blue", labelUr: "نیلا" },
  { id: "slate", label: "Slate Pro", labelUr: "سلیٹ" },
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
}) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem(storageKey) || defaultTheme
  );
  const [themeName, setThemeName] = useState(
    () => localStorage.getItem(themeNameKey) || "blue"
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
    themeNames,
    setTheme: (newTheme) => {
      localStorage.setItem(storageKey, newTheme);
      setTheme(newTheme);
    },
    setThemeName: (newName) => {
      localStorage.setItem(themeNameKey, newName);
      setThemeName(newName);
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