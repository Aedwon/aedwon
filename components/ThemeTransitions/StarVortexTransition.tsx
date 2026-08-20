"use client";

import React, { useEffect, useRef } from "react";

interface StarParticle {
  angle: number;
  radius: number;
  baseRadius: number;
  speed: number;
  ejectSpeed: number;
  size: number;
  rotAngle: number;
  rotSpeed: number;
  twinkleSpeed: number;
  twinklePhase: number;
  baseAlpha: number;
  mass: number;
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
  duration = 720,
  starCount = 160,
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
    const maxDim = Math.hypot(width, height);

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);

    const originX = origin?.x ?? width / 2;
    const originY = origin?.y ?? height / 2;

    const isDarkTarget = targetMode === "dark";

    // Phase 1 (Gathering) Colors: match target mode being collected
    const gatherStarColor = isDarkTarget ? "#000000" : "#FFFFFF";
    const gatherHaloStop0 = isDarkTarget ? "rgba(0, 0, 0, 0.5)" : "rgba(255, 255, 255, 0.45)";
    const gatherHaloStop1 = isDarkTarget ? "rgba(20, 20, 24, 0.2)" : "rgba(228, 228, 231, 0.15)";
    const gatherHaloStop2 = isDarkTarget ? "rgba(20, 20, 24, 0)" : "rgba(228, 228, 231, 0)";

    // Phase 2 (Explosion) Colors: contrast against the NEW flipped background
    const burstStarColor = isDarkTarget ? "#FFFFFF" : "#09090B";
    const burstHaloStop0 = isDarkTarget ? "rgba(255, 255, 255, 0.6)" : "rgba(9, 9, 11, 0.4)";
    const burstHaloStop1 = isDarkTarget ? "rgba(212, 212, 216, 0.2)" : "rgba(39, 39, 42, 0.15)";
    const burstHaloStop2 = isDarkTarget ? "rgba(212, 212, 216, 0)" : "rgba(39, 39, 42, 0)";
    const shockwaveColor = isDarkTarget ? "rgba(255, 255, 255," : "rgba(0, 0, 0,";

    // Directional Starlight with Velocity Stretch (Squash & Stretch principle)
    const drawStarlight = (
      x: number,
      y: number,
      size: number,
      rot: number,
      alpha: number,
      isPhase2: boolean,
      stretchFactor: number = 1,
      stretchAngle: number = 0
    ) => {
      if (alpha <= 0.01) return;

      ctx.save();
      ctx.translate(x, y);

      if (isPhase2 && stretchFactor > 1.05) {
        ctx.rotate(stretchAngle);
        ctx.scale(stretchFactor, 1 / Math.sqrt(stretchFactor));
      } else {
        ctx.rotate(rot);
      }

      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

      const halo0 = isPhase2 ? burstHaloStop0 : gatherHaloStop0;
      const halo1 = isPhase2 ? burstHaloStop1 : gatherHaloStop1;
      const halo2 = isPhase2 ? burstHaloStop2 : gatherHaloStop2;
      const coreColor = isPhase2 ? burstStarColor : gatherStarColor;

      // Soft diffuse starlight halo
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 2.0);
      grad.addColorStop(0, halo0);
      grad.addColorStop(0.5, halo1);
      grad.addColorStop(1, halo2);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, size * 2.0, 0, Math.PI * 2);
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
      ctx.fillStyle = coreColor;
      ctx.fill();

      ctx.restore();
    };

    // Generate stars with tiered physical properties (Mass, Ejection Speeds, Radius)
    const stars: StarParticle[] = Array.from({ length: starCount }, () => {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * (maxDim * 0.42) + 40;
      const mass = Math.random() * 0.8 + 0.6; // Heavy stars travel slower; light sparks blast far
      return {
        angle,
        radius,
        baseRadius: radius,
        speed: (Math.random() * 0.08 + 0.04) * (Math.random() > 0.5 ? 1 : -1),
        ejectSpeed: (0.45 + (1 / mass) * 0.55) * (Math.random() * 0.4 + 0.8),
        size: Math.random() * 4.5 + 2.5,
        rotAngle: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() * 0.06 + 0.02) * (Math.random() > 0.5 ? 1 : -1),
        twinkleSpeed: Math.random() * 0.025 + 0.015,
        twinklePhase: Math.random() * Math.PI * 2,
        baseAlpha: Math.random() * 0.35 + 0.65,
        mass,
      };
    });

    const startTime = performance.now();
    const splitPoint = 0.44; // 44% gathering, 56% explosion & deceleration

    const render = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      ctx.clearRect(0, 0, width, height);

      if (progress < splitPoint) {
        // PHASE 1: Gravitational Inward Condensation & Singularity Accumulation
        const pull = progress / splitPoint;
        // Cubic acceleration with anticipation compression
        const easePull = pull * pull * pull;

        // Singularity core glow growing at center
        const coreSize = 12 * Math.sin(pull * Math.PI * 0.5);
        if (coreSize > 1) {
          const coreGrad = ctx.createRadialGradient(originX, originY, 0, originX, originY, coreSize * 2.5);
          coreGrad.addColorStop(0, gatherHaloStop0);
          coreGrad.addColorStop(0.6, gatherHaloStop1);
          coreGrad.addColorStop(1, gatherHaloStop2);
          ctx.fillStyle = coreGrad;
          ctx.beginPath();
          ctx.arc(originX, originY, coreSize * 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        stars.forEach((s) => {
          s.angle += s.speed * (1 + easePull * 4.5);
          s.rotAngle += s.rotSpeed * (1 + easePull * 2.5);
          const r = s.baseRadius * (1 - easePull * 0.96);
          const px = originX + Math.cos(s.angle) * r;
          const py = originY + Math.sin(s.angle) * r;

          const twinkle = 0.5 + 0.5 * Math.sin(now * s.twinkleSpeed + s.twinklePhase);
          const alpha = s.baseAlpha * twinkle;

          drawStarlight(
            px,
            py,
            s.size * (1 - easePull * 0.3),
            s.rotAngle,
            alpha,
            false
          );
        });
      } else {
        // PHASE 2: Supernova Detonation with Quintic Easing & Shockwave Wavefront
        if (!flippedRef.current) {
          flippedRef.current = true;
          onFlipRef.current();
        }

        const explode = (progress - splitPoint) / (1 - splitPoint);

        // Quintic Ease-Out (Explosive initial impulse + viscous drag deceleration)
        const easeExplode = 1 - Math.pow(1 - explode, 4);

        // Instantaneous expansion velocity for velocity stretch (1 at start -> 0 at end)
        const velocity = Math.pow(1 - explode, 2.5);

        // 1. Expanding Delicate Shockwave Wavefront
        const shockRadius = easeExplode * maxDim * 0.75;
        const shockAlpha = (1 - explode) * (1 - explode) * 0.35;
        if (shockAlpha > 0.01) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(originX, originY, shockRadius, 0, Math.PI * 2);
          ctx.lineWidth = Math.max(1, 4 * (1 - explode));
          ctx.strokeStyle = `${shockwaveColor} ${shockAlpha})`;
          ctx.stroke();

          // Soft shockwave glow ring
          const ringGrad = ctx.createRadialGradient(
            originX,
            originY,
            Math.max(0, shockRadius - 20),
            originX,
            originY,
            shockRadius + 15
          );
          ringGrad.addColorStop(0, `${shockwaveColor} 0)`);
          ringGrad.addColorStop(0.5, `${shockwaveColor} ${shockAlpha * 0.4})`);
          ringGrad.addColorStop(1, `${shockwaveColor} 0)`);
          ctx.fillStyle = ringGrad;
          ctx.fill();
          ctx.restore();
        }

        // 2. Outward Ejected Starlight Particles with Inertia & Directional Stretch
        stars.forEach((s) => {
          s.rotAngle += s.rotSpeed * (1 + velocity * 1.5);

          // Radial distance driven by quintic ease and individual particle ejectSpeed
          const distance = (12 + s.ejectSpeed * maxDim * 0.55 * easeExplode);
          const px = originX + Math.cos(s.angle) * distance;
          const py = originY + Math.sin(s.angle) * distance;

          // Velocity-dependent stretch along trajectory angle
          const stretch = 1 + velocity * s.ejectSpeed * 2.2;
          const stretchAngle = s.angle;

          // Smooth exponential fade-out (no sudden pop)
          const twinkle = 0.6 + 0.4 * Math.sin(now * s.twinkleSpeed * 2.0 + s.twinklePhase);
          const alpha = s.baseAlpha * twinkle * Math.pow(1 - explode, 1.6);

          drawStarlight(
            px,
            py,
            s.size * (1 + easeExplode * 0.4),
            s.rotAngle,
            alpha,
            true,
            stretch,
            stretchAngle
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
  }, [duration, starCount, origin, targetMode]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 transition-none"
    />
  );
}
