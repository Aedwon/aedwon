# Design Specification: Navbar Sliding Motion & Page Transition System

## 1. Overview & Objectives

Refine page switching interactions across the portfolio by solving two core issues:
1. **Layout Stability:** Prevent horizontal shifting of the floating navbar capsule and page layout caused by the browser vertical scrollbar appearing or disappearing between pages of varying lengths.
2. **Interactive Motion:** Add fluid, tactile animations to navigation:
   - **Sliding Capsule Pill:** Smooth spring-animated indicator that glides between `Home`, `Projects`, and `Blogs` tabs.
   - **Spring Page Transitions:** Unobtrusive, fast, grounded route transitions (`8px` upward spring + opacity fade) on route change.

---

## 2. Layout Stability & Scrollbar Gutter

### 2.1 Problem
When navigating from a short page (e.g. initial loading state or short view) to a long scrollable page (e.g. `Projects` or dossier views), the browser adds a 15–17px vertical scrollbar track. This shifts all centered elements (`max-w-[860px] mx-auto` container and sticky centered `<header>`) horizontally to the left.

### 2.2 Solution
In `app/globals.css`, configure `html` with stable scrollbar reservations:
```css
html {
  scrollbar-gutter: stable;
  overflow-y: scroll;
}
```
- `scrollbar-gutter: stable` permanently reserves the scrollbar track space regardless of whether content overflows.
- `overflow-y: scroll` ensures consistent fallback across older browsers.
- Centered elements remain completely stationary with zero horizontal shift.

---

## 3. Navbar Sliding Indicator Architecture

### 3.1 Component Refactor (`components/Navbar.tsx`)
Upgrade the segmented navigation capsule to use Framer Motion's shared layout animations:
- Wrap each navigation item in a relative container with `Link`.
- The active item renders a `<motion.span layoutId="navbar-active-pill" />` as an absolute background element:
  ```tsx
  <Link
    key={item.href}
    href={item.href}
    className="relative px-3 py-1 text-[12px] sm:text-[12.5px] select-none transition-colors duration-150 active:scale-[0.94]"
  >
    {item.isActive && (
      <motion.span
        layoutId="navbar-active-pill"
        className="absolute inset-0 rounded-full bg-[var(--bg-card)] border border-black/[0.04] dark:border-white/[0.08] shadow-xs"
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 32,
        }}
      />
    )}
    <span
      className={`relative z-10 font-medium ${
        item.isActive
          ? "text-[var(--text-primary)] font-semibold"
          : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
      }`}
    >
      {item.label}
    </span>
  </Link>
  ```
- **Spring Physics:** `stiffness: 400`, `damping: 32` matches the tactile physical feel of macOS / iOS segmented control bars.

---

## 4. Page Transition System

### 4.1 Component Creation (`components/PageTransition.tsx`)
Create a client component that tracks route pathname changes and manages mounting/unmounting animation frames:

```tsx
"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{
          duration: 0.22,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

### 4.2 Integration (`app/layout.tsx`)
Wrap `<main>{children}</main>` inside `<PageTransition>`:
```tsx
<main>
  <PageTransition>{children}</PageTransition>
</main>
```

---

## 5. Accessibility & Reduced Motion

Add a CSS and Framer Motion media query check so users with `prefers-reduced-motion: reduce` receive instantaneous page swaps without translation transforms:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 6. Testing & Verification

1. **Navbar Unit Tests (`components/__tests__/navbar.test.tsx`):**
   - Verify all routes render (`Home`, `Projects`, `Blogs`).
   - Verify active route displays active state.
   - Verify theme popover open/close mechanics.
2. **PageTransition Unit Tests (`components/__tests__/page-transition.test.tsx`):**
   - Verify renders children correctly.
   - Verify responds to pathname changes.
3. **Vitest Test Suite:** Run `npm test` to ensure full test suite passes.
4. **Browser Verification:** Manually test route switching across `/`, `/projects`, `/blogs` to verify zero scrollbar jitter and fluid sliding pill animation.
