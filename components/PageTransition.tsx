"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

interface PageTransitionProps {
  children: React.ReactNode;
}

function getRouteIndex(path: string): number {
  if (path === "/") return 0;
  if (path.startsWith("/projects")) return 1;
  if (path.startsWith("/blogs")) return 2;
  return 0;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const previousPathRef = useRef(pathname);
  const hasMountedRef = useRef(false);

  useEffect(() => {
    const element = containerRef.current;
    const previousPath = previousPathRef.current;
    previousPathRef.current = pathname;

    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    if (!element) return;

    const prefersReducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const previousIndex = getRouteIndex(previousPath);
    const currentIndex = getRouteIndex(pathname);
    const direction =
      currentIndex === previousIndex ? 0 : currentIndex > previousIndex ? 1 : -1;

    const animation = element.animate(
      [
        { opacity: 0, transform: `translateX(${direction * 20}px)` },
        { opacity: 1, transform: "translateX(0)" },
      ],
      {
        duration: 220,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    );

    return () => animation.cancel();
  }, [pathname]);

  return (
    <div ref={containerRef} className="w-full">
      {children}
    </div>
  );
}
