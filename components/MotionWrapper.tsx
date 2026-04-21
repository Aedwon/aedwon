"use client";

import { motion, useReducedMotion, MotionProps, Variants } from "framer-motion";
import { ComponentPropsWithoutRef, ReactNode } from "react";

type MotionWrapperProps = MotionProps & {
  children: ReactNode;
  as?: "div" | "section" | "article" | "span";
  className?: string;
} & Omit<ComponentPropsWithoutRef<"div">, keyof MotionProps>;

export function MotionWrapper({
  children,
  as = "div",
  initial,
  animate,
  whileInView,
  transition,
  variants,
  ...rest
}: MotionWrapperProps) {
  const shouldReduceMotion = useReducedMotion();
  const Tag = motion[as];

  if (shouldReduceMotion) {
    return (
      <Tag
        transition={{ duration: 0 }}
        {...rest}
      >
        {children}
      </Tag>
    );
  }

  return (
    <Tag
      initial={initial}
      animate={animate}
      whileInView={whileInView}
      transition={transition}
      variants={variants as Variants | undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
}
