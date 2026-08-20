"use client";

import React from "react";
import { useTheme, ThemeStyle } from "@/components/ThemeContext";

interface DiscordUserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DiscordUserSettingsModal({
  isOpen,
  onClose,
}: DiscordUserSettingsModalProps) {
  const { theme, setTheme } = useTheme();

  if (!isOpen) return null;

  const handleSelectTheme = (newTheme: ThemeStyle) => {
    setTheme(newTheme);
  };

  return (
    <div
      id="settings-modal"
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
    >
      <div className="bg-[#313338] w-full max-w-md rounded-lg shadow-2xl border border-[#202225] overflow-hidden flex flex-col">
        {/* Modal Header */}
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
            >
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <h2 className="text-white font-bold text-base">
              User Settings &amp; Theme Switcher
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-[#949ba4] uppercase tracking-wider block mb-3">
              Switch Theme Style
            </label>
            <div className="grid grid-cols-3 gap-3">
              {/* Default */}
              <div
                onClick={() => handleSelectTheme("default")}
                className={`p-3 rounded border text-center cursor-pointer transition-all ${
                  theme === "default"
                    ? "bg-[#5865F2]/20 border-2 border-[#5865F2]"
                    : "bg-[#2b2d31] hover:bg-[#35373c] border-[#3f4147]"
                }`}
              >
                <div className="text-lg mb-1">⚪</div>
                <div
                  className={`text-xs font-bold ${
                    theme === "default" ? "text-[#5865F2]" : "text-white"
                  }`}
                >
                  Default
                </div>
              </div>

              {/* Neobrutalist */}
              <div
                onClick={() => handleSelectTheme("neobrutalist")}
                className={`p-3 rounded border text-center cursor-pointer transition-all ${
                  theme === "neobrutalist"
                    ? "bg-[#5865F2]/20 border-2 border-[#5865F2]"
                    : "bg-[#2b2d31] hover:bg-[#35373c] border-[#3f4147]"
                }`}
              >
                <div className="text-lg mb-1">🟨</div>
                <div
                  className={`text-xs font-bold ${
                    theme === "neobrutalist" ? "text-[#5865F2]" : "text-white"
                  }`}
                >
                  Neobrutalist
                </div>
              </div>

              {/* Discord */}
              <div
                onClick={() => handleSelectTheme("discord")}
                className={`p-3 rounded border text-center cursor-pointer transition-all ${
                  theme === "discord"
                    ? "bg-[#5865F2]/20 border-2 border-[#5865F2]"
                    : "bg-[#2b2d31] hover:bg-[#35373c] border-[#3f4147]"
                }`}
              >
                <div className="text-lg mb-1">💬</div>
                <div
                  className={`text-xs font-bold ${
                    theme === "discord" ? "text-[#5865F2]" : "text-white"
                  }`}
                >
                  Discord
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-[#2b2d31] border-t border-[#202225] flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-semibold px-4 py-2 rounded cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
