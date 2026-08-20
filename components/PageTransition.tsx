"use client";

import React, { useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

interface PageTransitionProps {
  children: React.ReactNode;
}

function getRouteIndex(path: string): number {
  if (path === "/") return 0;
  if (path.startsWith("/projects")) return 1;
  if (path.startsWith("/blogs")) return 2;
  return 1;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const prevPathRef = useRef(pathname);

  const currentIndex = getRouteIndex(pathname);
  const prevIndex = getRouteIndex(prevPathRef.current);

  // Direction follows navbar capsule indicator motion:
  // Moving to a higher tab index (e.g. Home -> Projects): enters from right (+20px)
  // Moving to a lower tab index (e.g. Projects -> Home): enters from left (-20px)
  const direction = currentIndex >= prevIndex ? 1 : -1;

  useEffect(() => {
    prevPathRef.current = pathname;
  }, [pathname]);

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, x: direction * 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.22,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}
