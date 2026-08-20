"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTheme } from "@/components/ThemeContext";

interface LogoConfig {
  id: string;
  name: string;
  group: "org" | "brand";
  file: string;
  adaptive?: boolean;
  defaultWidth: number;
  isHorizontal: boolean;
}

const LOGOS: LogoConfig[] = [
  // Organizations & LGUs
  { id: "moonton", name: "MOONTON Games", group: "org", file: "moonton.svg", adaptive: false, defaultWidth: 200, isHorizontal: true },
  { id: "dls", name: "Dark League Studios", group: "org", file: "dls.svg", adaptive: true, defaultWidth: 82, isHorizontal: false },
  { id: "ee", name: "Estudyante Esports", group: "org", file: "ee.svg", adaptive: true, defaultWidth: 190, isHorizontal: true },
  { id: "hoyoverse", name: "miHoYo (HoYoverse)", group: "org", file: "hoyoverse.svg", adaptive: true, defaultWidth: 198, isHorizontal: true },
  { id: "lgu-norala", name: "LGU Norala", group: "org", file: "lgu-norala.webp", adaptive: false, defaultWidth: 150, isHorizontal: true },
  { id: "psysc", name: "PSYSC", group: "org", file: "psysc.svg", adaptive: false, defaultWidth: 82, isHorizontal: false },
  { id: "up-diliman", name: "UP Diliman", group: "org", file: "up-diliman.svg", adaptive: false, defaultWidth: 82, isHorizontal: false },
  { id: "up-maroons", name: "UP Fighting Maroons", group: "org", file: "up-maroons.svg", adaptive: false, defaultWidth: 82, isHorizontal: false },
  { id: "up-fair", name: "UP Fair", group: "org", file: "up-fair.webp", adaptive: false, defaultWidth: 82, isHorizontal: false },
  { id: "up-kugihan", name: "UP Kugihan", group: "org", file: "up-kugihan.webp", adaptive: false, defaultWidth: 82, isHorizontal: false },
  { id: "dost", name: "DOST-SEI", group: "org", file: "dost.svg", adaptive: false, defaultWidth: 82, isHorizontal: false },
  { id: "pshs", name: "PSHS (Pisay)", group: "org", file: "pshs.svg", adaptive: false, defaultWidth: 82, isHorizontal: false },
  { id: "ilocos-sur", name: "Ilocos Sur", group: "org", file: "ilocos-sur.webp", adaptive: false, defaultWidth: 182, isHorizontal: true },

  // Brand Partners
  { id: "riot-games", name: "Riot Games", group: "brand", file: "riot-games.svg", adaptive: false, defaultWidth: 160, isHorizontal: true },
  { id: "ayala-malls", name: "Ayala Malls", group: "brand", file: "ayala-malls.svg", adaptive: true, defaultWidth: 200, isHorizontal: true },
  { id: "sm-supermalls", name: "SM Supermalls", group: "brand", file: "sm-supermalls.svg", adaptive: false, defaultWidth: 200, isHorizontal: true },
  { id: "smart", name: "Smart Communications", group: "brand", file: "smart.svg", adaptive: false, defaultWidth: 200, isHorizontal: true },
  { id: "converge", name: "Converge ICT", group: "brand", file: "converge.svg", adaptive: true, defaultWidth: 186, isHorizontal: true },
  { id: "oppo", name: "OPPO", group: "brand", file: "oppo.svg", adaptive: false, defaultWidth: 200, isHorizontal: true },
  { id: "msi", name: "MSI", group: "brand", file: "msi.svg", adaptive: true, defaultWidth: 164, isHorizontal: true },
  { id: "hotel101", name: "Hotel101 Group", group: "brand", file: "hotel101.webp", adaptive: false, defaultWidth: 82, isHorizontal: false },
  { id: "zowie", name: "BenQ ZOWIE", group: "brand", file: "zowie.svg", adaptive: false, defaultWidth: 82, isHorizontal: false },
  { id: "chronos", name: "Chronos Athletics", group: "brand", file: "chronos.webp", adaptive: false, defaultWidth: 82, isHorizontal: false },
];

export default function LogoSizingPage() {
  const { resolvedMode, setMode } = useTheme();
  
  // Baseline specs: w-[82px] h-[82px] rounded-[10px] p-[6px] gap-[10px]
  const [baseHeight, setBaseHeight] = useState(82);
  const [basePadding, setBasePadding] = useState(6);
  const [baseRadius, setBaseRadius] = useState(10);
  const [baseGap, setBaseGap] = useState(10);

  // Per-logo custom width state
  const [widths, setWidths] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    LOGOS.forEach((l) => {
      init[l.id] = l.defaultWidth;
    });
    return init;
  });

  const [copied, setCopied] = useState(false);

  const updateLogoWidth = (id: string, val: number) => {
    setWidths((prev) => ({
      ...prev,
      [id]: val,
    }));
  };

  const orgLogos = LOGOS.filter((l) => l.group === "org");
  const brandLogos = LOGOS.filter((l) => l.group === "brand");

  const jsonConfig = JSON.stringify(
    {
      base: {
        height: baseHeight,
        padding: basePadding,
        radius: baseRadius,
        gap: baseGap,
      },
      customWidths: widths,
    },
    null,
    2
  );

  const copyConfig = () => {
    navigator.clipboard.writeText(jsonConfig);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen pb-28">
      {/* Sticky Deck */}
      <div className="sticky top-0 z-50 bg-[var(--bg-canvas)]/92 backdrop-blur-xl border-b border-[var(--border-subtle)] py-3.5 -mx-6 sm:-mx-8 px-6 sm:px-8 shadow-md">
        <div className="max-w-[1100px] mx-auto space-y-3">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="text-xs font-mono text-[var(--text-dim)] hover:text-[var(--text-primary)] transition-colors"
              >
                ← Home
              </Link>
              <h1 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
                Per-Logo Width &amp; Proportion Tuner
              </h1>
              <span className="font-mono text-[11px] bg-black/[0.06] dark:bg-white/[0.08] px-2 py-0.5 rounded text-[var(--accent)] font-semibold">
                Height: {baseHeight}px · Pad: {basePadding}px · R: {baseRadius}px · Gap: {baseGap}px
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setMode(resolvedMode === "dark" ? "light" : "dark")}
                className="text-xs font-mono px-3 py-1.5 rounded-md bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--text-dim)] text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                Theme: {resolvedMode.toUpperCase()}
              </button>
              <button
                onClick={copyConfig}
                className="text-xs font-mono px-3.5 py-1.5 rounded-md bg-[var(--accent)] text-white hover:opacity-90 transition-all font-semibold cursor-pointer"
              >
                {copied ? "✓ Copied JSON!" : "Copy Configuration JSON"}
              </button>
            </div>
          </div>

          {/* Global Baseline Controls */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 border-t border-[var(--border-subtle)]">
            <div>
              <div className="flex justify-between text-[11.5px] font-mono text-[var(--text-dim)] mb-0.5">
                <span>Base Height</span>
                <span className="text-[var(--text-primary)] font-bold">{baseHeight}px</span>
              </div>
              <input
                type="range"
                min="44"
                max="110"
                step="2"
                value={baseHeight}
                onChange={(e) => setBaseHeight(Number(e.target.value))}
                className="w-full accent-[var(--accent)] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11.5px] font-mono text-[var(--text-dim)] mb-0.5">
                <span>Padding</span>
                <span className="text-[var(--text-primary)] font-bold">{basePadding}px</span>
              </div>
              <input
                type="range"
                min="2"
                max="16"
                step="1"
                value={basePadding}
                onChange={(e) => setBasePadding(Number(e.target.value))}
                className="w-full accent-[var(--accent)] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11.5px] font-mono text-[var(--text-dim)] mb-0.5">
                <span>Radius</span>
                <span className="text-[var(--text-primary)] font-bold">{baseRadius}px</span>
              </div>
              <input
                type="range"
                min="4"
                max="24"
                step="1"
                value={baseRadius}
                onChange={(e) => setBaseRadius(Number(e.target.value))}
                className="w-full accent-[var(--accent)] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11.5px] font-mono text-[var(--text-dim)] mb-0.5">
                <span>Gap</span>
                <span className="text-[var(--text-primary)] font-bold">{baseGap}px</span>
              </div>
              <input
                type="range"
                min="4"
                max="24"
                step="2"
                value={baseGap}
                onChange={(e) => setBaseGap(Number(e.target.value))}
                className="w-full accent-[var(--accent)] cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto pt-6 space-y-8">
        {/* Section 1: Live Row Simulation */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-6">
          <div>
            <h2 className="text-[17px] font-bold text-[var(--text-primary)] font-[var(--font-heading)]">
              Live Homepage Preview with Dynamic Widths
            </h2>
            <p className="text-[13px] text-[var(--text-muted)] mt-0.5">
              Watch how each logo scales and flows in real-time as you tweak individual widths below:
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[var(--text-dim)] mb-2.5">
                ORGANIZATIONS &amp; LGUS ({orgLogos.length})
              </div>
              <div className="flex flex-wrap items-center" style={{ gap: `${baseGap}px` }}>
                {orgLogos.map((item) => {
                  const w = widths[item.id] || 82;
                  return (
                    <div
                      key={item.id}
                      data-tooltip={`${item.name} (${w}px)`}
                      className="has-tooltip bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] hover:border-[#52525b] flex items-center justify-center transition-all duration-150 hover:-translate-y-0.5 cursor-pointer relative shadow-sm"
                      style={{
                        width: `${w}px`,
                        height: `${baseHeight}px`,
                        padding: `${basePadding}px`,
                        borderRadius: `${baseRadius}px`,
                      }}
                    >
                      <img
                        src={`/logos/${item.file}`}
                        alt={item.name}
                        className={`max-w-full max-h-full object-contain transition-all duration-200 ${
                          item.adaptive ? "logo-adaptive" : ""
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[var(--text-dim)] mb-2.5">
                EVENT &amp; BRAND PARTNERS ({brandLogos.length})
              </div>
              <div className="flex flex-wrap items-center" style={{ gap: `${baseGap}px` }}>
                {brandLogos.map((item) => {
                  const w = widths[item.id] || 82;
                  return (
                    <div
                      key={item.id}
                      data-tooltip={`${item.name} (${w}px)`}
                      className="has-tooltip bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] hover:border-[#52525b] flex items-center justify-center transition-all duration-150 hover:-translate-y-0.5 cursor-pointer relative shadow-sm"
                      style={{
                        width: `${w}px`,
                        height: `${baseHeight}px`,
                        padding: `${basePadding}px`,
                        borderRadius: `${baseRadius}px`,
                      }}
                    >
                      <img
                        src={`/logos/${item.file}`}
                        alt={item.name}
                        className={`max-w-full max-h-full object-contain transition-all duration-200 ${
                          item.adaptive ? "logo-adaptive" : ""
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Individual Tuner Cards Grid */}
        <div className="space-y-4">
          <div className="flex justify-between items-baseline flex-wrap gap-2">
            <div>
              <h2 className="text-[17px] font-bold text-[var(--text-primary)] font-[var(--font-heading)]">
                Individual Width Adjusters
              </h2>
              <p className="text-[13px] text-[var(--text-muted)] mt-0.5">
                Highlighted badges represent horizontal wordmarks (Moonton, HoYoverse, LGU Norala, Ayala Malls, SM Supermalls, Smart, Converge, OPPO):
              </p>
            </div>
            <button
              onClick={copyConfig}
              className="text-xs font-mono px-3 py-1.5 rounded-md bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--text-dim)] text-[var(--text-primary)] cursor-pointer"
            >
              {copied ? "✓ Copied JSON" : "Copy Specs JSON"}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {LOGOS.map((item) => {
              const w = widths[item.id] || 82;
              const isH = item.isHorizontal;

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border flex flex-col gap-3 transition-all ${
                    isH
                      ? "bg-blue-500/[0.04] border-blue-500/30 dark:border-blue-400/30"
                      : "bg-[var(--bg-card)] border-[var(--border-subtle)]"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[var(--text-primary)] truncate max-w-[180px]">
                      {item.name}
                    </span>
                    <span className="font-mono text-xs text-[var(--accent)] font-bold">
                      {w}px
                    </span>
                  </div>

                  {/* Visual Box Preview */}
                  <div className="h-[96px] bg-black/[0.03] dark:bg-white/[0.02] border border-dashed border-[var(--border-subtle)] rounded-lg flex items-center justify-center p-2 overflow-hidden">
                    <div
                      className="bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center shadow-sm"
                      style={{
                        width: `${w}px`,
                        height: `${baseHeight}px`,
                        padding: `${basePadding}px`,
                        borderRadius: `${baseRadius}px`,
                      }}
                    >
                      <img
                        src={`/logos/${item.file}`}
                        alt={item.name}
                        className={`max-w-full max-h-full object-contain ${
                          item.adaptive ? "logo-adaptive" : ""
                        }`}
                      />
                    </div>
                  </div>

                  {/* Width Slider */}
                  <div>
                    <div className="flex justify-between text-[11px] font-mono text-[var(--text-dim)] mb-1">
                      <span>Width</span>
                      <span>{isH ? "Horizontal" : "Square / 1:1"}</span>
                    </div>
                    <input
                      type="range"
                      min="60"
                      max="240"
                      step="2"
                      value={w}
                      onChange={(e) => updateLogoWidth(item.id, Number(e.target.value))}
                      className="w-full accent-[var(--accent)] cursor-pointer"
                    />
                  </div>

                  {/* Aspect Quick Buttons */}
                  <div className="flex gap-1 flex-wrap">
                    {[82, 110, 130, 150, 170, 190].map((quickVal) => (
                      <button
                        key={quickVal}
                        onClick={() => updateLogoWidth(item.id, quickVal)}
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded border transition-all cursor-pointer ${
                          w === quickVal
                            ? "bg-[var(--accent)] text-white border-[var(--accent)] font-semibold"
                            : "bg-black/[0.04] dark:bg-white/[0.06] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                        }`}
                      >
                        {quickVal}px
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
