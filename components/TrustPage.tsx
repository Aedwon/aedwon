import Link from "next/link";
import type { TrustPageContent } from "@/lib/site-content";

export default function TrustPage({ content }: { content: TrustPageContent }) {
  return (
    <article className="max-w-[760px] mx-auto space-y-8">
      <header className="space-y-3">
        <h1 className="text-[26px] sm:text-[30px] font-bold text-[var(--text-primary)] tracking-[-0.02em] leading-[1.3] font-[var(--font-heading)]">
          {content.title}
        </h1>
        <p className="text-[15px] leading-[1.75] text-[var(--text-muted)]">
          {content.intro}
        </p>
      </header>

      {content.sections.map((section) => (
        <section key={section.heading} className="space-y-3">
          <h2 className="text-[18px] font-semibold text-[var(--text-primary)] font-[var(--font-heading)]">
            {section.heading}
          </h2>
          {section.paragraphs.map((paragraph) => (
            <p
              key={paragraph}
              className="text-[15px] leading-[1.75] text-[var(--text-muted)]"
            >
              {paragraph}
            </p>
          ))}
          {section.links?.length ? (
            <ul className="space-y-2 pt-1">
              {section.links.map((link) => (
                <li key={link.href} className="text-[14px] leading-[1.6]">
                  {link.external || link.href.startsWith("http") || link.href.startsWith("mailto:") ? (
                    <a
                      href={link.href}
                      target={link.href.startsWith("http") ? "_blank" : undefined}
                      rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="text-[var(--accent)] hover:underline"
                    >
                      {link.label}
                      {link.href.startsWith("http") ? " ↗" : ""}
                    </a>
                  ) : (
                    <Link href={link.href} className="text-[var(--accent)] hover:underline">
                      {link.label} →
                    </Link>
                  )}
                  {link.description ? (
                    <span className="text-[var(--text-dim)]"> — {link.description}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
    </article>
  );
}
