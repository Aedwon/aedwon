"use client";

import React, { useEffect, useRef } from "react";
import { useTheme, type ThemeStyle } from "@/components/ThemeContext";

interface DiscordUserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FOCUSABLE_SELECTOR = [
  "button:not([disabled])",
  "a[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export default function DiscordUserSettingsModal({
  isOpen,
  onClose,
}: DiscordUserSettingsModalProps) {
  const { theme, setTheme } = useTheme();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((element) => !element.hasAttribute("disabled"));
      if (focusable.length === 0) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedRef.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectTheme = (newTheme: ThemeStyle) => {
    setTheme(newTheme);
  };

  const themeButtonClass = (selected: boolean) =>
    `p-3 rounded border text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-16 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C95FF] ${
      selected
        ? "bg-[#8C95FF]/15 border-2 border-[#8C95FF] text-white"
        : "bg-[#2b2d31] hover:bg-[#35373c] border-[#3f4147] text-gray-300 hover:text-white"
    }`;

  return (
    <div
      id="settings-modal"
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="discord-settings-title"
        aria-describedby="discord-settings-description"
        tabIndex={-1}
        className="bg-[#313338] w-full max-w-md rounded-lg shadow-2xl border border-[#202225] overflow-hidden flex flex-col"
      >
        <div className="p-4 border-b border-[#202225] flex items-center justify-between bg-[#2b2d31]">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-gray-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <h2 id="discord-settings-title" className="text-white font-bold text-base">
              User Settings &amp; Theme Switcher
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="text-gray-300 hover:text-white text-lg cursor-pointer p-2 rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C95FF]"
            aria-label="Close theme settings"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p id="discord-settings-description" className="sr-only">
            Choose a presentation style for this portfolio.
          </p>
          <fieldset>
            <legend className="text-xs font-bold text-[#B5BAC1] uppercase tracking-wider block mb-3">
              Switch Theme Style
            </legend>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                aria-pressed={theme === "default"}
                onClick={() => handleSelectTheme("default")}
                className={themeButtonClass(theme === "default")}
              >
                <svg
                  className="w-5 h-5 mb-1.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9" />
                </svg>
                <span className="text-xs font-bold">Default</span>
              </button>

              <button
                type="button"
                aria-pressed={theme === "neobrutalist"}
                onClick={() => handleSelectTheme("neobrutalist")}
                className={themeButtonClass(theme === "neobrutalist")}
              >
                <svg
                  className="w-5 h-5 fill-current mb-1.5"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <rect x="4" y="4" width="16" height="16" />
                </svg>
                <span className="text-xs font-bold">Neobrutalist</span>
              </button>

              <button
                type="button"
                aria-pressed={theme === "discord"}
                onClick={() => handleSelectTheme("discord")}
                className={themeButtonClass(theme === "discord")}
              >
                <svg
                  className="w-5 h-5 fill-current mb-1.5"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.078.078 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                <span className="text-xs font-bold">Discord</span>
              </button>
            </div>
          </fieldset>
        </div>

        <div className="p-3 bg-[#2b2d31] border-t border-[#202225] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-semibold px-4 py-2 rounded cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C95FF]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
