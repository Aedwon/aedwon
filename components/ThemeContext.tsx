"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

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

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    if (savedTheme) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    // Determine the data-theme value
    // For minimalist (default root), we can technically leave it empty or set a specific one if our CSS expects it.
    // Based on globals.css, minimalist is default on :root, but setting data-theme='minimalist' doesn't hurt if we want to be explicit later.
    // However, our globals.css defines non-root themes via [data-theme='...'].
    // So 'minimalist' should probably remove the attribute or set it to 'minimalist' if we had a selector for it.
    // The prompt implied :root is minimalist.
    // Let's set the attribute anyway so other components can key off it easily.

    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
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
