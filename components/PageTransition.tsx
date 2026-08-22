"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";

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
  const reduceMotion = useReducedMotion();
  const previousPathRef = useRef(pathname);
  const mountedRef = useRef(false);

  const currentIndex = getRouteIndex(pathname);
  const previousIndex = getRouteIndex(previousPathRef.current);
  const direction = currentIndex === previousIndex ? 0 : currentIndex > previousIndex ? 1 : -1;
  const shouldAnimate = mountedRef.current && !reduceMotion;

  useEffect(() => {
    previousPathRef.current = pathname;
    mountedRef.current = true;
  }, [pathname]);

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
