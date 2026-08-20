# Design Specification: Floating Capsule Navbar Redesign

## 1. Overview & Objectives

Refine the primary navigation bar from a full-bleed horizontal line header to a centered floating glass capsule. The new design conforms to the site's authentic DX/engineering design language (inspired by Hiroki Osame and modern macOS utilities) while maintaining full feature parity, brand identity, and theme transitions.

### Key Goals
- **Eliminate Clutter**: Replace the `-mx-6 sm:-mx-8` full-bleed dividing line with a self-contained floating capsule.
- **Preserve Brand Identity**: Maintain the signature `</aedwon>` monospace brand mark on the left.
- **Enhanced Navigation**: Add `Home` (`/`) alongside `Projects` (`/projects`) and `Blogs` (`/blogs`) in a segmented capsule pill with animated sliding indicator and tactile click feedback.
- **Clean Theme Controller**: Convert the theme switcher popover to an icons-only 2-row grid (Mode: Monitor, Sun, Moon; Theme: Circle, Square, Discord) with instant hover tooltips and micro-scale click press effects.
- **1:1 Visual & Motion Parity**: Every button, link, and trigger shares the identical tactile micro-animation curve (`active:scale-[0.94]`, smooth easing, glassmorphic backdrop blur).

---

## 2. Component Architecture & Visual Specifications

### 2.1 Placement & Container
- **Wrapper**: `sticky top-4 sm:top-6 z-40 flex justify-center mb-8 sm:mb-10 pointer-events-none`
  - Positioned sticky above hero content with `pointer-events-none` on the outer flexbox to avoid blocking underlying layout clicks.
- **Capsule Shell**: `pointer-events-auto inline-flex items-center gap-3.5 sm:gap-4 px-3.5 sm:px-4 py-1.5 rounded-full bg-[var(--bg-card)]/80 backdrop-blur-xl border border-[var(--border-subtle)] shadow-[0_12px_36px_rgba(0,0,0,0.35)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.5)]`
  - Fully responsive on mobile screens with tight horizontal padding.
  - Automatically respects all theme variables (`--bg-card`, `--border-subtle`, `--text-primary`).

### 2.2 Brand Mark
- **Markup**: `<Link href="/" className="font-mono text-[13.5px] font-semibold text-[var(--text-primary)] hover:opacity-85 active:scale-[0.96] transition-all cursor-pointer select-none pl-1">&lt;/aedwon&gt;</Link>`
- **Behavior**: Direct route to home with micro press scale.

### 2.3 Segmented Navigation Capsule
- **Container**: `relative flex items-center bg-black/[0.04] dark:bg-black/30 p-0.5 rounded-full border border-black/[0.03] dark:border-white/[0.04]`
- **Links**:
  1. `Home` (`/` — active if `pathname === "/"`)
  2. `Projects` (`/projects` — active if `pathname.startsWith("/projects")`)
  3. `Blogs` (`/blogs` — active if `pathname.startsWith("/blogs")`)
- **Active Indicator**: Animated sliding background pill or styled active pill with smooth layout transitions (`bg-[var(--bg-card)] text-[var(--text-primary)] font-semibold shadow-xs border border-black/[0.04] dark:border-white/[0.08]`).
- **Tactile Click Feedback**: `active:scale-[0.94] transition-all duration-150` on all link buttons.

### 2.4 Theme Switcher & Popover
- **Trigger**:
  - `w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center justify-center transition-all cursor-pointer border border-transparent hover:border-black/[0.06] dark:hover:border-white/[0.08] active:scale-[0.92]`
  - Palette icon (`w-3.5 h-3.5`).
- **Popover Menu**:
  - Anchored `absolute top-[calc(100%+8px)] right-0 w-[146px] bg-[var(--bg-card)] shadow-2xl rounded-xl p-1.5 z-50 flex flex-col gap-1.5 border border-[var(--border-subtle)] animate-in fade-in zoom-in-95 duration-150`.
  - **Row 1 (Mode - Icons Only)**:
    - 3-column grid (`grid grid-cols-3 gap-0.5 bg-black/[0.04] dark:bg-black/30 p-0.5 rounded-[9px]`).
    - Buttons: `Monitor` (`System`), `Sun` (`Light`), `Moon` (`Dark`).
    - Tooltip: `data-tooltip="System"`, `data-tooltip="Light"`, `data-tooltip="Dark"` using `.has-tooltip`.
    - Coordinates captured on click to drive `StarVortex` and `BayerDither` theme midpoint animations.
  - **Row 2 (Theme Style - Icons Only)**:
    - 3-column grid (`grid grid-cols-3 gap-0.5 bg-black/[0.04] dark:bg-black/30 p-0.5 rounded-[9px]`).
    - Buttons: `Circle` (`Default`), `Square` (`Neobrutalist`), Discord SVG glyph (`Discord`).
    - Tooltip: `data-tooltip="Default"`, `data-tooltip="Brutalist"`, `data-tooltip="Discord"`.
  - **Tactile Consistency**: Every single icon cell has `active:scale-[0.92] transition-transform` for uniform mechanical feedback.

---

## 3. State Flow & Transitions
- Popover click-outside detection via React `useEffect` + `useRef`.
- Mode changes invoke `setMode(newMode, origin)` from `ThemeContext` to trigger radial vortex / dither animations.
- Theme style changes invoke `setTheme(newTheme)` from `ThemeContext`.
- When `theme === "discord"`, mode row reflects "Dark mode only" or is disabled consistent with theme rules.

---

## 4. Verification Plan
- Verify all routes (`/`, `/projects`, `/blogs`) highlight the active capsule link correctly.
- Verify click on `</aedwon>` navigates to `/`.
- Test popover open/close behavior on click and outside-click.
- Test Theme mode transitions (Light <-> Dark) in Default and Neobrutalist styles.
- Verify Discord theme behavior.
- Validate responsive layout on mobile viewport widths (320px, 375px, 420px).
