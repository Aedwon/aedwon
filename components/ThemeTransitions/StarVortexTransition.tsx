"use client";

import React, { useEffect, useRef } from "react";

interface StarParticle {
  angle: number;
  radius: number;
  baseRadius: number;
  speed: number;
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

export default function StarVortexTransition({
  origin,
  targetMode = "dark",
  onFlipTheme,
  onComplete,
  duration = 640,
  starCount = 140,
}: StarVortexTransitionProps) {
  const onFlipRef = useRef(onFlipTheme);
  const onCompleteRef = useRef(onComplete);
  onFlipRef.current = onFlipTheme;
  onCompleteRef.current = onComplete;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);
  const flippedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);

    const originX = origin?.x ?? width / 2;
    const originY = origin?.y ?? height / 2;

    const isDarkTarget = targetMode === "dark";
    const starColor = isDarkTarget ? "#000000" : "#FFFFFF";
    const haloStop0 = isDarkTarget ? "rgba(0, 0, 0, 0.45)" : "rgba(255, 255, 255, 0.45)";
    const haloStop1 = isDarkTarget ? "rgba(20, 20, 24, 0.18)" : "rgba(228, 228, 231, 0.15)";
    const haloStop2 = isDarkTarget ? "rgba(20, 20, 24, 0)" : "rgba(228, 228, 231, 0)";

    // Fast, GPU-friendly 4-Point Concave Starlight Renderer (Zero shadowBlur overhead for locked 120 FPS)
    const draw4PointStarlight = (
      x: number,
      y: number,
      size: number,
      rot: number,
      alpha: number
    ) => {
      if (alpha <= 0.01) return;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

      // Soft diffuse starlight halo (Gradient fill - 120 FPS accelerated)
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 1.8);
      grad.addColorStop(0, haloStop0);
      grad.addColorStop(0.5, haloStop1);
      grad.addColorStop(1, haloStop2);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, size * 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Sharp 4-Point Starlight Core
      const spikes = 4;
      const outerR = size;
      const innerR = size * 0.22;

      ctx.beginPath();
      for (let i = 0; i < spikes * 2; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const angle = (i / (spikes * 2)) * Math.PI * 2;
        const px = Math.cos(angle) * r;
        const py = Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fillStyle = starColor;
      ctx.fill();

      ctx.restore();
    };

    // Generate monochromatic starlight particles
    const stars: StarParticle[] = Array.from({ length: starCount }, () => {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * (Math.max(width, height) * 0.45) + 30;
      return {
        angle,
        radius,
        baseRadius: radius,
        speed: (Math.random() * 0.07 + 0.035) * (Math.random() > 0.5 ? 1 : -1),
        size: Math.random() * 5.0 + 3.0,
        rotAngle: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() * 0.05 + 0.02) * (Math.random() > 0.5 ? 1 : -1),
        twinkleSpeed: Math.random() * 0.02 + 0.012,
        twinklePhase: Math.random() * Math.PI * 2,
        baseAlpha: Math.random() * 0.3 + 0.7,
      };
    });

    const startTime = performance.now();

    const render = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      ctx.clearRect(0, 0, width, height);

      if (progress < 0.48) {
        // Phase 1: Inward Gravitational Vortex & High-Speed Twinkle
        const pull = progress / 0.48;
        const easePull = pull * pull;

        stars.forEach((s) => {
          s.angle += s.speed * (1 + easePull * 3.2);
          s.rotAngle += s.rotSpeed * (1 + easePull * 1.8);
          const r = s.baseRadius * (1 - easePull * 0.92);
          const px = originX + Math.cos(s.angle) * r;
          const py = originY + Math.sin(s.angle) * r;

          const twinkle = 0.45 + 0.55 * Math.sin(now * s.twinkleSpeed + s.twinklePhase);
          const alpha = s.baseAlpha * twinkle;

          draw4PointStarlight(
            px,
            py,
            s.size * (1 - easePull * 0.25),
            s.rotAngle,
            alpha
          );
        });
      } else {
        // Phase 2: Supernova Burst Outward Across Screen
        if (!flippedRef.current) {
          flippedRef.current = true;
          onFlipRef.current();
        }

        const explode = (progress - 0.48) / 0.52;
        const easeExplode = 1 - Math.pow(1 - explode, 3);

        stars.forEach((s) => {
          s.angle += s.speed * 0.3;
          s.rotAngle += s.rotSpeed * 1.2;
          const r = s.baseRadius * (0.08 + easeExplode * 4.8);
          const px = originX + Math.cos(s.angle) * r;
          const py = originY + Math.sin(s.angle) * r;

          const twinkle = 0.5 + 0.5 * Math.sin(now * s.twinkleSpeed * 1.5 + s.twinklePhase);
          const alpha = s.baseAlpha * twinkle * (1 - explode);

          draw4PointStarlight(
            px,
            py,
            s.size * (1 + easeExplode * 0.6),
            s.rotAngle,
            alpha
          );
        });
      }

      if (progress < 1) {
        animRef.current = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, width, height);
        onCompleteRef.current();
      }
    };

    animRef.current = requestAnimationFrame(render);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [duration, starCount, origin]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 transition-none"
    />
  );
}
