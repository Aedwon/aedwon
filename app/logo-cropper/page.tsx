"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useTheme } from "@/components/ThemeContext";

interface CropState {
  top: number;
  bottom: number;
  left: number;
  right: number;
  width: number;
}

export default function LogoCropperPage() {
  const { resolvedMode, setMode } = useTheme();

  // LGU Norala state (512x512)
  const [noralaCrop, setNoralaCrop] = useState<CropState>({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: 152,
  });

  // Ilocos Sur state (447x447)
  const [ilocosCrop, setIlocosCrop] = useState<CropState>({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: 102,
  });

  const noralaCanvasRef = useRef<HTMLCanvasElement>(null);
  const ilocosCanvasRef = useRef<HTMLCanvasElement>(null);

  const [copied, setCopied] = useState(false);

  // Render Canvas previews
  useEffect(() => {
    // Norala
    const imgN = new Image();
    imgN.src = "/logos/lgu-norala.webp";
    imgN.onload = () => {
      const cvs = noralaCanvasRef.current;
      if (!cvs) return;
      const origW = imgN.naturalWidth || 512;
      const origH = imgN.naturalHeight || 512;

      const cropT = Math.round((noralaCrop.top / 100) * origH);
      const cropB = Math.round((noralaCrop.bottom / 100) * origH);
      const cropL = Math.round((noralaCrop.left / 100) * origW);
      const cropR = Math.round((noralaCrop.right / 100) * origW);

      const croppedW = Math.max(10, origW - cropL - cropR);
      const croppedH = Math.max(10, origH - cropT - cropB);

      cvs.width = croppedW;
      cvs.height = croppedH;
      const ctx = cvs.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, croppedW, croppedH);
        ctx.drawImage(imgN, cropL, cropT, croppedW, croppedH, 0, 0, croppedW, croppedH);
      }
    };

    // Ilocos
    const imgI = new Image();
    imgI.src = "/logos/ilocos-sur.webp";
    imgI.onload = () => {
      const cvs = ilocosCanvasRef.current;
      if (!cvs) return;
      const origW = imgI.naturalWidth || 447;
      const origH = imgI.naturalHeight || 447;

      const cropT = Math.round((ilocosCrop.top / 100) * origH);
      const cropB = Math.round((ilocosCrop.bottom / 100) * origH);
      const cropL = Math.round((ilocosCrop.left / 100) * origW);
      const cropR = Math.round((ilocosCrop.right / 100) * origW);

      const croppedW = Math.max(10, origW - cropL - cropR);
      const croppedH = Math.max(10, origH - cropT - cropB);

      cvs.width = croppedW;
      cvs.height = croppedH;
      const ctx = cvs.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, croppedW, croppedH);
        ctx.drawImage(imgI, cropL, cropT, croppedW, croppedH, 0, 0, croppedW, croppedH);
      }
    };
  }, [noralaCrop, ilocosCrop]);

  const combinedJSON = JSON.stringify(
    {
      "lgu-norala": {
        topPercent: noralaCrop.top,
        bottomPercent: noralaCrop.bottom,
        leftPercent: noralaCrop.left,
        rightPercent: noralaCrop.right,
        topPixels: Math.round((noralaCrop.top / 100) * 512),
        bottomPixels: Math.round((noralaCrop.bottom / 100) * 512),
        finalWidth: noralaCrop.width,
      },
      "ilocos-sur": {
        topPercent: ilocosCrop.top,
        bottomPercent: ilocosCrop.bottom,
        leftPercent: ilocosCrop.left,
        rightPercent: ilocosCrop.right,
        topPixels: Math.round((ilocosCrop.top / 100) * 447),
        bottomPixels: Math.round((ilocosCrop.bottom / 100) * 447),
        finalWidth: ilocosCrop.width,
      },
    },
    null,
    2
  );

  const copyConfig = () => {
    navigator.clipboard.writeText(combinedJSON);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCanvas = (canvasRef: React.RefObject<HTMLCanvasElement | null>, filename: string) => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = filename;
    link.href = canvasRef.current.toDataURL("image/webp", 1.0);
    link.click();
  };

  return (
    <div className="min-h-screen pb-28">
      {/* Sticky Deck */}
      <div className="sticky top-0 z-50 bg-[var(--bg-canvas)]/92 backdrop-blur-xl border-b border-[var(--border-subtle)] py-4 -mx-6 sm:-mx-8 px-6 sm:px-8 shadow-md">
        <div className="max-w-[1100px] mx-auto flex justify-between items-center flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-mono text-[var(--text-dim)] hover:text-[var(--text-primary)] transition-colors"
            >
              ← Home
            </Link>
            <h1 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
              Logo Cropping &amp; Sizing Laboratory
            </h1>
            <span className="font-mono text-[11px] bg-black/[0.06] dark:bg-white/[0.08] px-2 py-0.5 rounded text-[var(--accent)] font-semibold">
              LGU Norala &amp; Ilocos Sur
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
              {copied ? "✓ Copied JSON!" : "Copy Cropping Specs JSON"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto pt-8 space-y-8">
        
        {/* WORKBENCH 1: LGU NORALA */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8 shadow-sm">
          {/* Stage with red crop boundary */}
          <div className="flex flex-col items-center gap-3">
            <div className="text-xs font-mono font-bold text-[var(--text-primary)]">
              Original + Crop Boundary
            </div>
            <div className="relative w-[240px] h-[240px] bg-black/[0.04] dark:bg-white/[0.02] border border-[var(--border-subtle)] rounded-lg overflow-hidden flex items-center justify-center">
              <img
                src="/logos/lgu-norala.webp"
                alt="LGU Norala"
                className="max-w-full max-h-full object-contain"
              />
              <div
                className="absolute border-2 border-red-500 bg-red-500/10 pointer-events-none transition-all duration-75"
                style={{
                  top: `${noralaCrop.top}%`,
                  bottom: `${noralaCrop.bottom}%`,
                  left: `${noralaCrop.left}%`,
                  right: `${noralaCrop.right}%`,
                  boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.55)",
                }}
              />
            </div>
            <span className="text-[11px] font-mono text-[var(--text-dim)]">Source: 512 × 512px</span>
          </div>

          {/* Sliders & In-context preview */}
          <div className="space-y-5">
            <div className="border-b border-[var(--border-subtle)] pb-2 flex justify-between items-baseline">
              <h2 className="text-base font-bold text-[var(--text-primary)]">1. Municipality of Norala</h2>
              <span className="text-xs font-mono text-[var(--accent)] font-semibold">
                Top: {noralaCrop.top}% ({Math.round((noralaCrop.top / 100) * 512)}px) · Bottom: {noralaCrop.bottom}% · W: {noralaCrop.width}px
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs font-mono text-[var(--text-dim)] mb-1">
                  <span>Top Crop</span>
                  <span className="text-[var(--text-primary)] font-bold">{noralaCrop.top}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="45"
                  value={noralaCrop.top}
                  onChange={(e) => setNoralaCrop({ ...noralaCrop, top: Number(e.target.value) })}
                  className="w-full accent-[var(--accent)] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-[var(--text-dim)] mb-1">
                  <span>Bottom Crop</span>
                  <span className="text-[var(--text-primary)] font-bold">{noralaCrop.bottom}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="45"
                  value={noralaCrop.bottom}
                  onChange={(e) => setNoralaCrop({ ...noralaCrop, bottom: Number(e.target.value) })}
                  className="w-full accent-[var(--accent)] cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs font-mono text-[var(--text-dim)] mb-1">
                  <span>Left Crop</span>
                  <span className="text-[var(--text-primary)] font-bold">{noralaCrop.left}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={noralaCrop.left}
                  onChange={(e) => setNoralaCrop({ ...noralaCrop, left: Number(e.target.value) })}
                  className="w-full accent-[var(--accent)] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-[var(--text-dim)] mb-1">
                  <span>Right Crop</span>
                  <span className="text-[var(--text-primary)] font-bold">{noralaCrop.right}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={noralaCrop.right}
                  onChange={(e) => setNoralaCrop({ ...noralaCrop, right: Number(e.target.value) })}
                  className="w-full accent-[var(--accent)] cursor-pointer"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-[var(--text-dim)] mb-1">
                <span>Badge Container Width</span>
                <span className="text-[var(--text-primary)] font-bold">{noralaCrop.width}px</span>
              </div>
              <input
                type="range"
                min="82"
                max="220"
                step="2"
                value={noralaCrop.width}
                onChange={(e) => setNoralaCrop({ ...noralaCrop, width: Number(e.target.value) })}
                className="w-full accent-[var(--accent)] cursor-pointer"
              />
            </div>

            {/* Live Badge Preview */}
            <div className="p-4 rounded-xl bg-black/[0.03] dark:bg-white/[0.02] border border-[var(--border-subtle)] space-y-3">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-dim)]">
                Live Homepage Badge Simulation (82px Height · 6px Padding)
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <div
                  className="h-[82px] p-[6px] rounded-[10px] bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center shadow-sm overflow-hidden"
                  style={{ width: `${noralaCrop.width}px` }}
                >
                  <canvas ref={noralaCanvasRef} className="max-w-full max-h-full object-contain" />
                </div>
                <button
                  onClick={() => downloadCanvas(noralaCanvasRef, "lgu-norala.webp")}
                  className="text-xs font-mono px-3 py-1.5 rounded-md bg-black/[0.05] dark:bg-white/[0.08] hover:bg-black/[0.1] dark:hover:bg-white/[0.14] border border-[var(--border-subtle)] text-[var(--text-primary)] cursor-pointer"
                >
                  Download Cropped WebP
                </button>
              </div>
            </div>
          </div>
        </div>


        {/* WORKBENCH 2: ILOCOS SUR */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8 shadow-sm">
          {/* Stage with red crop boundary */}
          <div className="flex flex-col items-center gap-3">
            <div className="text-xs font-mono font-bold text-[var(--text-primary)]">
              Original + Crop Boundary
            </div>
            <div className="relative w-[240px] h-[240px] bg-black/[0.04] dark:bg-white/[0.02] border border-[var(--border-subtle)] rounded-lg overflow-hidden flex items-center justify-center">
              <img
                src="/logos/ilocos-sur.webp"
                alt="Provincial Govt of Ilocos Sur"
                className="max-w-full max-h-full object-contain"
              />
              <div
                className="absolute border-2 border-red-500 bg-red-500/10 pointer-events-none transition-all duration-75"
                style={{
                  top: `${ilocosCrop.top}%`,
                  bottom: `${ilocosCrop.bottom}%`,
                  left: `${ilocosCrop.left}%`,
                  right: `${ilocosCrop.right}%`,
                  boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.55)",
                }}
              />
            </div>
            <span className="text-[11px] font-mono text-[var(--text-dim)]">Source: 447 × 447px</span>
          </div>

          {/* Sliders & In-context preview */}
          <div className="space-y-5">
            <div className="border-b border-[var(--border-subtle)] pb-2 flex justify-between items-baseline">
              <h2 className="text-base font-bold text-[var(--text-primary)]">2. Provincial Government of Ilocos Sur</h2>
              <span className="text-xs font-mono text-[var(--accent)] font-semibold">
                Top: {ilocosCrop.top}% ({Math.round((ilocosCrop.top / 100) * 447)}px) · Bottom: {ilocosCrop.bottom}% · W: {ilocosCrop.width}px
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs font-mono text-[var(--text-dim)] mb-1">
                  <span>Top Crop</span>
                  <span className="text-[var(--text-primary)] font-bold">{ilocosCrop.top}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="45"
                  value={ilocosCrop.top}
                  onChange={(e) => setIlocosCrop({ ...ilocosCrop, top: Number(e.target.value) })}
                  className="w-full accent-[var(--accent)] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-[var(--text-dim)] mb-1">
                  <span>Bottom Crop</span>
                  <span className="text-[var(--text-primary)] font-bold">{ilocosCrop.bottom}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="45"
                  value={ilocosCrop.bottom}
                  onChange={(e) => setIlocosCrop({ ...ilocosCrop, bottom: Number(e.target.value) })}
                  className="w-full accent-[var(--accent)] cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs font-mono text-[var(--text-dim)] mb-1">
                  <span>Left Crop</span>
                  <span className="text-[var(--text-primary)] font-bold">{ilocosCrop.left}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={ilocosCrop.left}
                  onChange={(e) => setIlocosCrop({ ...ilocosCrop, left: Number(e.target.value) })}
                  className="w-full accent-[var(--accent)] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-[var(--text-dim)] mb-1">
                  <span>Right Crop</span>
                  <span className="text-[var(--text-primary)] font-bold">{ilocosCrop.right}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={ilocosCrop.right}
                  onChange={(e) => setIlocosCrop({ ...ilocosCrop, right: Number(e.target.value) })}
                  className="w-full accent-[var(--accent)] cursor-pointer"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-[var(--text-dim)] mb-1">
                <span>Badge Container Width</span>
                <span className="text-[var(--text-primary)] font-bold">{ilocosCrop.width}px</span>
              </div>
              <input
                type="range"
                min="82"
                max="220"
                step="2"
                value={ilocosCrop.width}
                onChange={(e) => setIlocosCrop({ ...ilocosCrop, width: Number(e.target.value) })}
                className="w-full accent-[var(--accent)] cursor-pointer"
              />
            </div>

            {/* Live Badge Preview */}
            <div className="p-4 rounded-xl bg-black/[0.03] dark:bg-white/[0.02] border border-[var(--border-subtle)] space-y-3">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-dim)]">
                Live Homepage Badge Simulation (82px Height · 6px Padding)
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <div
                  className="h-[82px] p-[6px] rounded-[10px] bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center shadow-sm overflow-hidden"
                  style={{ width: `${ilocosCrop.width}px` }}
                >
                  <canvas ref={ilocosCanvasRef} className="max-w-full max-h-full object-contain" />
                </div>
                <button
                  onClick={() => downloadCanvas(ilocosCanvasRef, "ilocos-sur.webp")}
                  className="text-xs font-mono px-3 py-1.5 rounded-md bg-black/[0.05] dark:bg-white/[0.08] hover:bg-black/[0.1] dark:hover:bg-white/[0.14] border border-[var(--border-subtle)] text-[var(--text-primary)] cursor-pointer"
                >
                  Download Cropped WebP
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
