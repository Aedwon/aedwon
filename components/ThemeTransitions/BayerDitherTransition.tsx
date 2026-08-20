"use client";

import React, { useEffect, useRef } from "react";

// Authentic 8x8 Bayer Ordered Dither Matrix Table from 1984 MacPaint
const BAYER_8X8 = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
];

interface BayerDitherTransitionProps {
  sourceMode: "light" | "dark";
  targetMode: "light" | "dark";
  onFlipTheme: () => void;
  onComplete: () => void;
  duration?: number;
}

export default function BayerDitherTransition({
  sourceMode,
  onFlipTheme,
  onComplete,
  duration = 620,
}: BayerDitherTransitionProps) {
  const onFlipRef = useRef(onFlipTheme);
  const onCompleteRef = useRef(onComplete);
  onFlipRef.current = onFlipTheme;
  onCompleteRef.current = onComplete;

  const topLayerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number | null>(null);

  // Build One Single 45° Diagonal Bayer Dither Slicing Polygon
  const buildSingleDiagonalBayerPolygon = (rawProg: number) => {
    const steps = 64; // 64 discrete Bayer pixel steps
    const bandWidth = 28; // 28% width diagonal dither tooth spread

    // Distance required to guarantee 100% full screen coverage at t=0 and 100% cleared off-screen at t=1
    const startSweep = -bandWidth - 10;
    const endSweep = 200 + bandWidth + 25;
    const sweep = startSweep + rawProg * (endSweep - startSweep);

    const points: string[] = [];

    // The top layer is retained on the bottom-right side as the wave passes
    points.push("100% 0%");

    for (let i = 0; i <= steps; i++) {
      const y = (i / steps) * 100;
      const r8 = i % 8;
      const bayerVal = (BAYER_8X8[r8][(i * 3) % 8] / 64 - 0.5) * bandWidth;

      const rawX = sweep - y + bayerVal;
      const x = Math.max(0, Math.min(100, rawX));

      if (i === 0) {
        points.push(`${x.toFixed(2)}% 0%`);
      } else {
        const prevY = ((i - 1) / steps) * 100;
        points.push(`${x.toFixed(2)}% ${prevY.toFixed(2)}%`);
        points.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`);
      }
    }

    points.push("100% 100%");

    return `polygon(${points.join(", ")})`;
  };

  useEffect(() => {
    const topLayer = topLayerRef.current;
    const surface = document.getElementById("portfolio-main-surface");

    if (!topLayer || !surface) {
      onFlipRef.current();
      onCompleteRef.current();
      return;
    }

    // Clone the active surface so real DOM content matches 1:1
    const clone = surface.cloneNode(true) as HTMLElement;
    clone.removeAttribute("id");
    clone.style.pointerEvents = "none";
    clone.style.transform = "none";
    clone.style.transition = "none";

    const contentContainer = topLayer.querySelector(".clone-container");
    if (contentContainer) {
      contentContainer.innerHTML = "";
      contentContainer.appendChild(clone);
    }

    // 1. Prepare Top Layer in SOURCE mode covering 100% synchronously at t=0
    const poly0 = buildSingleDiagonalBayerPolygon(0);
    topLayer.style.clipPath = poly0;
    (topLayer.style as any).webkitClipPath = poly0;
    topLayer.style.display = "block";

    // 2. Synchronously flip underlying base DOM to TARGET mode
    onFlipRef.current();

    const startTime = performance.now();

    const render = (now: number) => {
      const elapsed = now - startTime;
      const rawProgress = Math.min(elapsed / duration, 1);

      // Smooth custom cubic ease-in-out curve
      const ease =
        rawProgress < 0.5
          ? 4 * rawProgress * rawProgress * rawProgress
          : 1 - Math.pow(-2 * rawProgress + 2, 3) / 2;

      const poly = buildSingleDiagonalBayerPolygon(ease);
      topLayer.style.clipPath = poly;
      (topLayer.style as any).webkitClipPath = poly;

      if (rawProgress < 1) {
        animRef.current = requestAnimationFrame(render);
      } else {
        // 3. 100% off-screen past (W, H) -> hide cleanly with zero glitch
        topLayer.style.display = "none";
        topLayer.style.clipPath = "";
        (topLayer.style as any).webkitClipPath = "";
        onCompleteRef.current();
      }
    };

    animRef.current = requestAnimationFrame(render);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [duration, sourceMode]);

  const isLight = sourceMode === "light";

  return (
    <div
      ref={topLayerRef}
      className={`fixed inset-0 pointer-events-none z-40 overflow-hidden font-mono select-none hidden ${
        isLight ? "bg-[#FEF08A] text-black" : "bg-[#121212] text-white"
      }`}
      style={{
        transform: "translateZ(0)",
        contain: "paint layout style",
        willChange: "clip-path",
      }}
    >
      <div className="clone-container w-full min-h-screen" />
    </div>
  );
}
