"use client";

import { useTheme } from "./ThemeContext";
import { StateLabel } from "./StateLabel";

export default function ServicesStatusStrip() {
    const { theme } = useTheme();

    if (theme !== 'minimalist') return null;

    return (
        <section className="px-6 md:px-12 lg:px-24 py-8 border-t border-rule bg-paper text-ink">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="font-mono text-micro tracking-widest uppercase opacity-60">
                    § 01 — AVAILABILITY
                </div>
                <StateLabel />
            </div>
        </section>
    );
}
