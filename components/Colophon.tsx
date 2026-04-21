"use client";

import { useTheme, THEME_LABELS, type Theme } from "./ThemeContext";

export function Colophon() {
  const { setTheme } = useTheme();
  const order: Theme[] = ["minimalist", "neubrutalist", "discord"];

  return (
    <p className="text-small opacity-80">
      This site has three skins —
      {order.map((t, i) => (
        <span key={t}>
          {" "}
          <button
            onClick={() => setTheme(t)}
            className="underline underline-offset-2 decoration-rule hover:decoration-ink hover:text-accent transition-colors"
          >
            {THEME_LABELS[t].toLowerCase()}
          </button>
          {i < order.length - 1 ? "," : "."}
        </span>
      ))}
      {" "}It remembers.
    </p>
  );
}
