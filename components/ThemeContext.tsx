"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { track, setPersonProperty } from "@/lib/analytics";

// Updated Theme types to match new specs
export type Theme = "minimalist" | "neubrutalist" | "discord";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const THEME_LABELS: Record<Theme, string> = {
  minimalist: "Paper",
  neubrutalist: "Sticker",
  discord: "Server",
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Defaulting to "minimalist" (Agency)
  const [theme, setTheme] = useState<Theme>("minimalist");
  const previousTheme = useRef<Theme | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    if (savedTheme) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);

    const previous = previousTheme.current;
    if (previous === null) {
      track("theme_initialized", { theme, label: THEME_LABELS[theme] });
    } else if (previous !== theme) {
      track("theme_changed", {
        from: previous,
        to: theme,
        label: THEME_LABELS[theme],
      });
    }
    setPersonProperty("preferred_theme", theme);
    previousTheme.current = theme;
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
