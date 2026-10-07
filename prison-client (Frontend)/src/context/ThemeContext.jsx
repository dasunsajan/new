import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

const read = (key, fallback, allowed) => {
  const v = localStorage.getItem(key);
  return allowed.includes(v) ? v : fallback;
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(read("theme", "light", ["light", "dark"]));
  const [fontSize, setFontSize] = useState(read("fontSize", "medium", ["small", "medium", "large"]));

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const sizes = { small: "14px", medium: "16px", large: "18px" };
    document.documentElement.style.fontSize = sizes[fontSize];
    localStorage.setItem("fontSize", fontSize);
  }, [fontSize]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, fontSize, setFontSize }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}