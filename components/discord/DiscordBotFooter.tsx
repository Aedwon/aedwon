"use client";

import React from "react";

export default function DiscordBotFooter() {
  return (
    <div className="flex gap-4 group hover:bg-[#2e3035] -mx-4 px-4 py-2 rounded transition-colors mt-6 pt-4 border-t border-[#3f4147]/20">
      <div className="w-10 h-10 rounded-full bg-[#202225] flex items-center justify-center text-gray-400 font-mono text-xs font-bold shrink-0 mt-0.5 border border-white/5">
        &lt;/&gt;
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-gray-300 text-[13px]">Portfolio</span>
          <span className="bg-[#5865F2] text-white text-[9px] font-bold px-1 rounded uppercase">
            BOT
          </span>
          <span className="text-[11px] text-[#949ba4]">Today at 12:06 PM</span>
        </div>
        <p className="text-xs text-[#949ba4] font-mono">
          © 2026 Aerol (Aedwon) · Built with Next.js &amp; React
        </p>
      </div>
    </div>
  );
}
