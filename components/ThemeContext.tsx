"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import StarVortexTransition from "./ThemeTransitions/StarVortexTransition";

export type ThemeStyle = "default" | "neobrutalist" | "discord";
export type ThemeMode = "system" | "light" | "dark";

interface ThemeContextType {
  theme: ThemeStyle;
  mode: ThemeMode;
  resolvedMode: "light" | "dark";
  isTransitioning: boolean;
  setTheme: (theme: ThemeStyle) => void;
  setMode: (mode: ThemeMode, origin?: { x: number; y: number }) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeStyle>("default");
  const [mode, setModeState] = useState<ThemeMode>("dark");
  const [resolvedMode, setResolvedMode] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  const [activeTransition, setActiveTransition] = useState<{
    theme: ThemeStyle;
    sourceMode: "light" | "dark";
    targetMode: "light" | "dark";
    origin?: { x: number; y: number };
    pendingMode: ThemeMode;
  } | null>(null);

  useEffect(() => {
    let savedTheme: ThemeStyle = "default";
    let savedMode: ThemeMode = "dark";
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        savedTheme = (localStorage.getItem("aedwon-theme") as ThemeStyle) || "default";
        savedMode = (localStorage.getItem("aedwon-mode") as ThemeMode) || "dark";
      }
    } catch {}

    let effectiveMode: "light" | "dark" = "dark";
    if (savedTheme === "discord") {
      effectiveMode = "dark";
      savedMode = "dark";
    } else if (savedTheme === "neobrutalist") {
      effectiveMode = "light";
      savedMode = "light";
    } else if (savedMode === "system") {
      effectiveMode = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } else {
      effectiveMode = savedMode;
    }

    setThemeState(savedTheme);
    setModeState(savedMode);
    setResolvedMode(effectiveMode);

    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.setAttribute("data-theme", savedTheme);
      root.setAttribute("data-mode", effectiveMode);
    }

    setMounted(true);
  }, []);

  const applyThemeMode = useCallback((targetEffective: "light" | "dark", targetModeSetting: ThemeMode) => {
    setResolvedMode(targetEffective);
    setModeState(targetModeSetting);
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-mode", targetEffective);
    }
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem("aedwon-mode", targetModeSetting);
      }
    } catch {}
  }, []);

  const setTheme = (newTheme: ThemeStyle) => {
    setThemeState(newTheme);
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", newTheme);
    }
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem("aedwon-theme", newTheme);
      }
    } catch {}

    // Discord theme is always dark mode, Neobrutalist is always light mode
    if (newTheme === "discord") {
      applyThemeMode("dark", "dark");
    } else if (newTheme === "neobrutalist") {
      applyThemeMode("light", "light");
    }
  };

  const setMode = useCallback(
    (newMode: ThemeMode, origin?: { x: number; y: number }) => {
      // Discord (dark only) and Neobrutalist (light only) have no mode toggle
      if (theme === "discord" || theme === "neobrutalist") return;

      let targetEffective: "light" | "dark" = "dark";
      if (newMode === "system") {
        targetEffective = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      } else {
        targetEffective = newMode;
      }

      // Check for prefers-reduced-motion
      if (
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        applyThemeMode(targetEffective, newMode);
        return;
      }

      if (targetEffective === resolvedMode) {
        setModeState(newMode);
        localStorage.setItem("aedwon-mode", newMode);
        return;
      }

      if (activeTransition) return;

      setActiveTransition({
        theme,
        sourceMode: resolvedMode,
        targetMode: targetEffective,
        origin,
        pendingMode: newMode,
      });
    },
    [theme, resolvedMode, activeTransition, applyThemeMode]
  );

  const handleMidpointFlip = useCallback(() => {
    if (activeTransition) {
      applyThemeMode(activeTransition.targetMode, activeTransition.pendingMode);
    }
  }, [activeTransition, applyThemeMode]);

  const handleTransitionComplete = useCallback(() => {
    setActiveTransition(null);
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        mode,
        resolvedMode,
        isTransitioning: activeTransition !== null,
        setTheme,
        setMode,
      }}
    >
      {children}

      {/* Active Transition Overlays (Default theme only) */}
      {activeTransition && activeTransition.theme === "default" && (
        <StarVortexTransition
          origin={activeTransition.origin}
          targetMode={activeTransition.targetMode}
          sourceMode={activeTransition.sourceMode}
          onFlipTheme={handleMidpointFlip}
          onComplete={handleTransitionComplete}
        />
      )}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
