/** Scrolls to a section and moves focus to its heading. Smooth, or instant under reduced motion. */
export function jumpTo(id: string): boolean {
  const section = document.getElementById(id);
  if (!section) return false;
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  if (typeof section.scrollIntoView === "function") {
    section.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }
  try {
    history.replaceState(null, "", `#${id}`);
  } catch {
    // some embedded browsers block this
  }
  const heading = section.querySelector<HTMLElement>("h2");
  heading?.focus({ preventScroll: true });
  return true;
}
