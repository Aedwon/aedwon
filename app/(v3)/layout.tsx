import "@/lib/design-v3/tokens.css";

// The v3 redesign shell. Pages here own their routes; navigation happens
// client-side inside the Site shell (history.pushState), so every route
// renders the same client component with the URL-derived start scene.
export default function V3Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
