import Link from "next/link";

const RECOVERY_LINKS = [
  ["Home", "/"],
  ["Projects", "/projects"],
  ["Blogs", "/blogs"],
  ["About", "/about"],
  ["llms.txt", "/llms.txt"],
  ["sitemap.xml", "/sitemap.xml"],
] as const;

export default function NotFound() {
  return (
    <main className="max-w-[720px] mx-auto py-12 space-y-5">
      <div className="space-y-2">
        <p className="text-[12px] font-mono text-[var(--text-dim)]">404</p>
        <h1 className="text-[26px] sm:text-[30px] font-bold text-[var(--text-primary)] tracking-[-0.02em] font-[var(--font-heading)]">
          Page not found
        </h1>
        <p className="text-[15px] leading-[1.7] text-[var(--text-muted)]">
          That path is not part of this portfolio. Use one of the canonical indexes below to recover.
        </p>
      </div>

      <ul className="space-y-2 text-[14px]">
        {RECOVERY_LINKS.map(([label, href]) => (
          <li key={href}>
            <Link href={href} className="text-[var(--accent)] hover:underline">
              {label} →
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
