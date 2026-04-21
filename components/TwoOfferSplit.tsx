"use client";

import Link from "next/link";
import { useTheme } from "./ThemeContext";
import { SectionMarker } from "./SectionMarker";

export default function TwoOfferSplit() {
    const { theme } = useTheme();

    if (theme !== 'minimalist') return null;

    return (
        <section className="px-6 md:px-12 lg:px-24 py-24 border-t border-rule">
            <div className="max-w-6xl mx-auto">
                <SectionMarker number="02" label="TWO SALES, ONE STUDIO" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                    <Link href="/web-solutions" className="group border border-rule p-10 hover:border-ink transition-colors flex flex-col gap-4">
                        <div className="font-mono text-micro tracking-widest uppercase opacity-60">The stranger sale</div>
                        <h2 className="font-serif text-h2 font-bold tracking-tight leading-tight">
                            Sites, products, and landing pages that convert first-time visitors into customers.
                        </h2>
                        <span className="mt-auto inline-flex items-center gap-2 text-small opacity-80 group-hover:text-accent transition-colors">
                            See web solutions →
                        </span>
                    </Link>

                    <Link href="/community-solutions" className="group border border-rule p-10 hover:border-ink transition-colors flex flex-col gap-4">
                        <div className="font-mono text-micro tracking-widest uppercase opacity-60">The regular sale</div>
                        <h2 className="font-serif text-h2 font-bold tracking-tight leading-tight">
                            Bots, moderation, and rituals that make members come back in month eight.
                        </h2>
                        <span className="mt-auto inline-flex items-center gap-2 text-small opacity-80 group-hover:text-accent transition-colors">
                            See community systems →
                        </span>
                    </Link>
                </div>
            </div>
        </section>
    );
}
