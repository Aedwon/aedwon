"use client";

interface SectionMarkerProps {
  number: string;
  label: string;
}

export function SectionMarker({ number, label }: SectionMarkerProps) {
  return (
    <div className="font-mono text-micro tracking-widest uppercase text-accent mb-6">
      § {number} — {label}
    </div>
  );
}
