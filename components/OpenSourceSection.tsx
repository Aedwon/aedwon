import { OpenSourceGrid } from "@/components/OpenSourceCard";

export default function OpenSourceSection() {
  return (
    <section id="open-source" className="space-y-4">
      <h2 className="text-[18px] font-semibold text-[var(--text-primary)] font-[var(--font-heading)]">
        Open source
      </h2>
      <OpenSourceGrid />
    </section>
  );
}
