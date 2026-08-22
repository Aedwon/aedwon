"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";

interface PageTransitionProps {
  children: React.ReactNode;
}

interface RouteTransitionState {
  path: string;
  previousIndex: number;
  hasNavigated: boolean;
}

function getRouteIndex(path: string): number {
  if (path === "/") return 0;
  if (path.startsWith("/projects")) return 1;
  if (path.startsWith("/blogs")) return 2;
  return 0;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [routeState, setRouteState] = useState<RouteTransitionState>(() => ({
    path: pathname,
    previousIndex: getRouteIndex(pathname),
    hasNavigated: false,
  }));

  if (routeState.path !== pathname) {
    setRouteState({
      path: pathname,
      previousIndex: getRouteIndex(routeState.path),
      hasNavigated: true,
    });
  }

  const currentIndex = getRouteIndex(pathname);
  const direction =
    currentIndex === routeState.previousIndex
      ? 0
      : currentIndex > routeState.previousIndex
        ? 1
        : -1;
  const shouldAnimate = routeState.hasNavigated && !reduceMotion;

  return (
    <motion.div
      key={pathname}
      initial={shouldAnimate ? { opacity: 0, x: direction * 20 } : false}
      animate={{ opacity: 1, x: 0 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { duration: 0.22, ease: [0.16, 1, 0.3, 1] }
      }
      className="w-full"
    >
      {children}
    </motion.div>
  );
}
