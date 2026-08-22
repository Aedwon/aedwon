import React from "react";

export default function AboutSection() {
  return (
    <section>
      <h2 className="text-[17px] font-semibold text-[var(--text-primary)] mb-3 font-[var(--font-heading)]">
        About
      </h2>
      <div className="space-y-4 text-[14.5px] leading-[1.65] text-[var(--text-muted)]">
        <p>
          I spend around 80% of any project on research and planning before writing code. I obsess over hyper-optimization, always evaluating whether an architecture or workflow is truly the most optimal choice for the problem.
        </p>
        <p>
          My daily stack for agentic engineering includes Claude Code, Codex, the using-superpowers skill framework, Matt Pocock&apos;s engineering skills, and Gemini&apos;s Deep Research.
        </p>
      </div>
    </section>
  );
}
