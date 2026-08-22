"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import StarVortexTransition from "./ThemeTransitions/StarVortexTransition";
import { scheduleIdlePrewarm } from "@/lib/utils/asset-prewarmer";

export type ThemeStyle = "default" | "neobrutalist" | "discord";
export type ThemeMode = "system" | "light" | "dark";

type ResolvedMode = "light" | "dark";

interface ThemeContextType {
  theme: ThemeStyle;
  mode: ThemeMode;
  resolvedMode: ResolvedMode;
  isNeobrutalist: boolean;
  isDiscord: boolean;
  supportsColorMode: boolean;
  isTransitioning: boolean;
  setTheme: (theme: ThemeStyle) => void;
  setMode: (mode: ThemeMode, origin?: { x: number; y: number }) => void;
}

interface ActiveTransition {
  sourceMode: ResolvedMode;
  targetMode: ResolvedMode;
  origin?: { x: number; y: number };
  pendingMode: ThemeMode;
}

const THEME_KEY = "aedwon-theme";
const MODE_KEY = "aedwon-mode";
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function isThemeStyle(value: string | null): value is ThemeStyle {
  return value === "default" || value === "neobrutalist" || value === "discord";
}

function isThemeMode(value: string | null): value is ThemeMode {
  return value === "system" || value === "light" || value === "dark";
}

function getSystemMode(): ResolvedMode {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function resolveMode(theme: ThemeStyle, mode: ThemeMode): ResolvedMode {
  if (theme === "discord") return "dark";
  if (theme === "neobrutalist") return "light";
  return mode === "system" ? getSystemMode() : mode;
}

function readStorage(key: string): string | null {
  try {
    return window.localStorage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string): void {
  try {
    window.localStorage?.setItem(key, value);
  } catch {
    // Theme state remains usable when storage is blocked or unavailable.
  }
}

function applyDocumentTheme(theme: ThemeStyle, resolvedMode: ResolvedMode): void {
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.setAttribute("data-mode", resolvedMode);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeStyle>("default");
  const [mode, setModeState] = useState<ThemeMode>("dark");
  const [resolvedMode, setResolvedMode] = useState<ResolvedMode>("dark");
  const [activeTransition, setActiveTransition] = useState<ActiveTransition | null>(null);
  const cancelPrewarmRef = useRef<(() => void) | null>(null);
  const transitionFlippedRef = useRef(false);

  const isNeobrutalist = theme === "neobrutalist";
  const isDiscord = theme === "discord";
  const supportsColorMode = theme === "default";

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;
      const storedTheme = readStorage(THEME_KEY);
      const storedMode = readStorage(MODE_KEY);
      const initialTheme = isThemeStyle(storedTheme) ? storedTheme : "default";
      const initialMode = isThemeMode(storedMode) ? storedMode : "dark";
      const initialResolvedMode = resolveMode(initialTheme, initialMode);

      setThemeState(initialTheme);
      setModeState(initialMode);
      setResolvedMode(initialResolvedMode);
      applyDocumentTheme(initialTheme, initialResolvedMode);
    });

    cancelPrewarmRef.current = scheduleIdlePrewarm(1000);
    return () => {
      cancelled = true;
      cancelPrewarmRef.current?.();
    };
  }, []);

  useEffect(() => {
    if (mode !== "system" || theme !== "default" || typeof window.matchMedia !== "function") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event: MediaQueryListEvent) => {
      if (activeTransition) return;
      const nextMode: ResolvedMode = event.matches ? "dark" : "light";
      setResolvedMode(nextMode);
      document.documentElement.setAttribute("data-mode", nextMode);
    };

    media.addEventListener?.("change", handleChange);
    return () => media.removeEventListener?.("change", handleChange);
  }, [activeTransition, mode, theme]);

  const applyMode = useCallback((effectiveMode: ResolvedMode, modeSetting: ThemeMode) => {
    setResolvedMode(effectiveMode);
    setModeState(modeSetting);
    document.documentElement.setAttribute("data-mode", effectiveMode);
    writeStorage(MODE_KEY, modeSetting);
  }, []);

  const setTheme = useCallback(
    (newTheme: ThemeStyle) => {
      transitionFlippedRef.current = false;
      setActiveTransition(null);
      setThemeState(newTheme);
      writeStorage(THEME_KEY, newTheme);

      const effectiveMode = resolveMode(newTheme, mode);
      setResolvedMode(effectiveMode);
      applyDocumentTheme(newTheme, effectiveMode);
    },
    [mode],
  );

  const setMode = useCallback(
    (newMode: ThemeMode, origin?: { x: number; y: number }) => {
      if (!supportsColorMode || activeTransition) return;

      const targetEffective = resolveMode("default", newMode);
      const prefersReducedMotion =
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (prefersReducedMotion || targetEffective === resolvedMode) {
        applyMode(targetEffective, newMode);
        return;
      }

      transitionFlippedRef.current = false;
      setActiveTransition({
        sourceMode: resolvedMode,
        targetMode: targetEffective,
        origin,
        pendingMode: newMode,
      });
    },
    [activeTransition, applyMode, resolvedMode, supportsColorMode],
  );

  const handleMidpointFlip = useCallback(() => {
    if (!activeTransition || transitionFlippedRef.current) return;
    transitionFlippedRef.current = true;
    applyMode(activeTransition.targetMode, activeTransition.pendingMode);
  }, [activeTransition, applyMode]);

  const handleTransitionComplete = useCallback(() => {
    transitionFlippedRef.current = false;
    setActiveTransition(null);
  }, []);

  const value = useMemo<ThemeContextType>(
    () => ({
      theme,
      mode,
      resolvedMode,
      isNeobrutalist,
      isDiscord,
      supportsColorMode,
      isTransitioning: activeTransition !== null,
      setTheme,
      setMode,
    }),
    [
      activeTransition,
      isDiscord,
      isNeobrutalist,
      mode,
      resolvedMode,
      setMode,
      setTheme,
      supportsColorMode,
      theme,
    ],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
      {activeTransition && (
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
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
}
