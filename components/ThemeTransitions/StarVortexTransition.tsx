"use client";

import React, { useEffect, useRef } from "react";

interface StarParticle {
  angle: number;
  baseRadius: number;
  speed: number;
  ejectSpeed: number;
  size: number;
  rotAngle: number;
  rotSpeed: number;
  twinkleSpeed: number;
  twinklePhase: number;
  baseAlpha: number;
}

interface StarVortexTransitionProps {
  origin?: { x: number; y: number };
  targetMode?: "light" | "dark";
  sourceMode?: "light" | "dark";
  onFlipTheme: () => void;
  onComplete: () => void;
  duration?: number;
  starCount?: number;
}

function createStarSprite(
  coreColor: string,
  halo0: string,
  halo1: string,
  halo2: string,
  spriteDim = 64,
): HTMLCanvasElement | null {
  const canvas = document.createElement("canvas");
  canvas.width = spriteDim;
  canvas.height = spriteDim;
  const context = canvas.getContext("2d");
  if (!context) return null;

  const center = spriteDim / 2;
  const gradient = context.createRadialGradient(center, center, 0, center, center, center);
  gradient.addColorStop(0, halo0);
  gradient.addColorStop(0.5, halo1);
  gradient.addColorStop(1, halo2);
  context.fillStyle = gradient;
  context.beginPath();
  context.arc(center, center, center, 0, Math.PI * 2);
  context.fill();

  const coreRadius = spriteDim * 0.25;
  const innerRadius = coreRadius * 0.22;
  context.beginPath();
  for (let index = 0; index < 8; index += 1) {
    const radius = index % 2 === 0 ? coreRadius : innerRadius;
    const angle = (index / 8) * Math.PI * 2;
    const x = center + Math.cos(angle) * radius;
    const y = center + Math.sin(angle) * radius;
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  }
  context.closePath();
  context.fillStyle = coreColor;
  context.fill();
  return canvas;
}

function createCoreSprite(color0: string, color1: string, color2: string): HTMLCanvasElement | null {
  const size = 96;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) return null;

  const center = size / 2;
  const gradient = context.createRadialGradient(center, center, 0, center, center, center);
  gradient.addColorStop(0, color0);
  gradient.addColorStop(0.6, color1);
  gradient.addColorStop(1, color2);
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);
  return canvas;
}

export default function StarVortexTransition({
  origin,
  targetMode = "dark",
  onFlipTheme,
  onComplete,
  duration = 720,
  starCount = 140,
}: StarVortexTransitionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const flippedRef = useRef(false);
  const completedRef = useRef(false);

  useEffect(() => {
    flippedRef.current = false;
    completedRef.current = false;

    const finish = () => {
      if (completedRef.current) return;
      completedRef.current = true;
      document.documentElement.classList.remove("is-theme-transitioning");
      onComplete();
    };

    const flip = () => {
      if (flippedRef.current) return;
      flippedRef.current = true;
      onFlipTheme();
    };

    if (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      flip();
      finish();
      return;
    }

    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) {
      flip();
      finish();
      return;
    }

    document.documentElement.classList.add("is-theme-transitioning");

    const isDarkTarget = targetMode === "dark";
    const gatherStarColor = isDarkTarget ? "#000000" : "#FFFFFF";
    const gatherHalo0 = isDarkTarget ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.45)";
    const gatherHalo1 = isDarkTarget ? "rgba(20,20,24,0.2)" : "rgba(228,228,231,0.15)";
    const gatherHalo2 = isDarkTarget ? "rgba(20,20,24,0)" : "rgba(228,228,231,0)";
    const burstStarColor = isDarkTarget ? "#FFFFFF" : "#09090B";
    const burstHalo0 = isDarkTarget ? "rgba(255,255,255,0.6)" : "rgba(9,9,11,0.4)";
    const burstHalo1 = isDarkTarget ? "rgba(212,212,216,0.2)" : "rgba(39,39,42,0.15)";
    const burstHalo2 = isDarkTarget ? "rgba(212,212,216,0)" : "rgba(39,39,42,0)";
    const shockwaveRgb = isDarkTarget ? "255,255,255" : "0,0,0";

    const gatherSprite = createStarSprite(
      gatherStarColor,
      gatherHalo0,
      gatherHalo1,
      gatherHalo2,
    );
    const burstSprite = createStarSprite(
      burstStarColor,
      burstHalo0,
      burstHalo1,
      burstHalo2,
    );
    const coreSprite = createCoreSprite(gatherHalo0, gatherHalo1, gatherHalo2);

    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
      maxDim: Math.hypot(window.innerWidth, window.innerHeight),
      originX: origin?.x ?? window.innerWidth / 2,
      originY: origin?.y ?? window.innerHeight / 2,
    };

    const resizeCanvas = () => {
      const previousMaxDim = viewport.maxDim;
      viewport.width = window.innerWidth;
      viewport.height = window.innerHeight;
      viewport.dpr = Math.min(window.devicePixelRatio || 1, 2);
      viewport.maxDim = Math.hypot(viewport.width, viewport.height);
      viewport.originX = origin?.x ?? viewport.width / 2;
      viewport.originY = origin?.y ?? viewport.height / 2;

      canvas.width = Math.round(viewport.width * viewport.dpr);
      canvas.height = Math.round(viewport.height * viewport.dpr);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      context.setTransform(viewport.dpr, 0, 0, viewport.dpr, 0, 0);

      if (previousMaxDim > 0 && stars.length > 0) {
        const scale = viewport.maxDim / previousMaxDim;
        for (const star of stars) star.baseRadius *= scale;
      }
    };

    const stars: StarParticle[] = [];
    for (let index = 0; index < starCount; index += 1) {
      const mass = Math.random() * 0.8 + 0.6;
      stars.push({
        angle: Math.random() * Math.PI * 2,
        baseRadius: Math.random() * (viewport.maxDim * 0.42) + 40,
        speed: (Math.random() * 0.08 + 0.04) * (Math.random() > 0.5 ? 1 : -1),
        ejectSpeed: (0.45 + (1 / mass) * 0.55) * (Math.random() * 0.4 + 0.8),
        size: Math.random() * 4.5 + 2.5,
        rotAngle: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() * 0.06 + 0.02) * (Math.random() > 0.5 ? 1 : -1),
        twinkleSpeed: Math.random() * 0.025 + 0.015,
        twinklePhase: Math.random() * Math.PI * 2,
        baseAlpha: Math.random() * 0.35 + 0.65,
      });
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas, { passive: true });

    const drawStar = (
      sprite: HTMLCanvasElement | null,
      x: number,
      y: number,
      size: number,
      rotation: number,
      alpha: number,
      stretch = 1,
    ) => {
      if (!sprite || alpha <= 0.01) return;
      context.save();
      context.translate(x, y);
      context.rotate(rotation);
      if (stretch > 1.05) context.scale(stretch, 1 / Math.sqrt(stretch));
      context.globalAlpha = Math.max(0, Math.min(1, alpha));
      const drawSize = size * 4;
      context.drawImage(sprite, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
      context.restore();
    };

    const startTime = performance.now();
    const splitPoint = 0.44;
    let cancelled = false;

    const render = (now: number) => {
      if (cancelled) return;
      const progress = Math.min((now - startTime) / duration, 1);
      context.clearRect(0, 0, viewport.width, viewport.height);

      if (progress < splitPoint) {
        const pull = progress / splitPoint;
        const easedPull = pull * pull * pull;
        const coreSize = 12 * Math.sin(pull * Math.PI * 0.5);

        if (coreSprite && coreSize > 1) {
          const size = coreSize * 5;
          context.globalAlpha = 1;
          context.drawImage(
            coreSprite,
            viewport.originX - size / 2,
            viewport.originY - size / 2,
            size,
            size,
          );
        }

        for (const star of stars) {
          star.angle += star.speed * (1 + easedPull * 4.5);
          star.rotAngle += star.rotSpeed * (1 + easedPull * 2.5);
          const radius = star.baseRadius * (1 - easedPull * 0.96);
          const x = viewport.originX + Math.cos(star.angle) * radius;
          const y = viewport.originY + Math.sin(star.angle) * radius;
          const twinkle = 0.5 + 0.5 * Math.sin(now * star.twinkleSpeed + star.twinklePhase);
          drawStar(
            gatherSprite,
            x,
            y,
            star.size * (1 - easedPull * 0.3),
            star.rotAngle,
            star.baseAlpha * twinkle,
          );
        }
      } else {
        flip();
        const explode = (progress - splitPoint) / (1 - splitPoint);
        const easedExplode = 1 - Math.pow(1 - explode, 4);
        const velocity = Math.pow(1 - explode, 2.5);
        const shockRadius = easedExplode * viewport.maxDim * 0.75;
        const shockAlpha = Math.pow(1 - explode, 2) * 0.35;

        if (shockAlpha > 0.01) {
          context.globalAlpha = 1;
          context.beginPath();
          context.arc(viewport.originX, viewport.originY, shockRadius, 0, Math.PI * 2);
          context.lineWidth = Math.max(1, 4 * (1 - explode));
          context.strokeStyle = `rgba(${shockwaveRgb},${shockAlpha})`;
          context.stroke();
        }

        for (const star of stars) {
          star.rotAngle += star.rotSpeed * (1 + velocity * 1.5);
          const distance = 12 + star.ejectSpeed * viewport.maxDim * 0.55 * easedExplode;
          const x = viewport.originX + Math.cos(star.angle) * distance;
          const y = viewport.originY + Math.sin(star.angle) * distance;
          const twinkle = 0.6 + 0.4 * Math.sin(now * star.twinkleSpeed * 2 + star.twinklePhase);
          const alpha = star.baseAlpha * twinkle * Math.pow(1 - explode, 1.6);
          const stretch = 1 + velocity * star.ejectSpeed * 2.2;
          drawStar(
            burstSprite,
            x,
            y,
            star.size * (1 + easedExplode * 0.4),
            star.angle,
            alpha,
            stretch,
          );
        }
      }

      context.globalAlpha = 1;
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(render);
      } else {
        context.clearRect(0, 0, viewport.width, viewport.height);
        finish();
      }
    };

    animationRef.current = requestAnimationFrame(render);

    return () => {
      cancelled = true;
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
      document.documentElement.classList.remove("is-theme-transitioning");
    };
  }, [duration, onComplete, onFlipTheme, origin, starCount, targetMode]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-50 transition-none"
    />
  );
}
