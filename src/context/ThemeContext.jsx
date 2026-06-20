import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({
  theme: "system",
  themeName: "blue",
  setTheme: () => null,
  setThemeName: () => null,
});

const themeNames = [
  { id: "blue", label: "Default Blue", labelUr: "نیلا" },
  { id: "ocean", label: "Ocean Teal", labelUr: "سمندری" },
  { id: "emerald", label: "Emerald Green", labelUr: "سبز" },
  { id: "amber", label: "Amber Warm", labelUr: "سنہری" },
  { id: "slate", label: "Slate Pro", labelUr: "سلیٹ" },
];

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
    const root = window.document.documentElement;
    root.classList.remove("light", "dark", ...themeNames.map(t => `theme-${t.id}`));

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }

    if (themeName !== "blue") {
      root.classList.add(`theme-${themeName}`);
    }
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
