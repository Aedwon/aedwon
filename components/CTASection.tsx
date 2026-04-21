"use client";

import { useTheme } from "./ThemeContext";
import { motion } from "framer-motion";
import { ArrowRight, Calendar } from "lucide-react";
import Link from "next/link";
import { StateLabel } from "./StateLabel";
import { CTA } from "@/lib/portfolio";

export default function CTASection() {
    const { theme } = useTheme();

    if (theme === 'minimalist') {
        return (
            <section className="px-6 md:px-12 lg:px-24 py-24 md:py-32 border-t border-rule bg-paper text-ink">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="font-mono text-micro tracking-widest uppercase text-accent mb-6">
                        § 07 — START
                    </div>
                    <h2 className="font-serif text-h1 md:text-display font-bold tracking-tight leading-[1.05]">
                        Still here?
                    </h2>
                    <p className="mt-8 text-h3 max-w-2xl mx-auto opacity-80 leading-snug">
                        Then we should probably talk. Fifteen minutes. I&apos;ll tell you honestly if I can help — and if I can&apos;t, who might.
                    </p>
                    <div className="mt-12 flex justify-center">
                        <Link href="/contact" className="inline-flex items-center gap-2 bg-accent text-paper px-8 py-4 font-sans text-body hover:opacity-90 transition-opacity">
                            Book a discovery call →
                        </Link>
                    </div>
                    <div className="mt-8 flex justify-center">
                        <StateLabel />
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className={`
            py-24 px-6 md:px-12 lg:px-24 border-b border-theme transition-colors duration-300
            ${theme === 'neubrutalist' ? 'bg-[#FFEB3B] border-b-[3px] border-black' : ''}
            ${theme === 'discord' ? 'bg-accent' : ''}
        `}>
            <div className="max-w-4xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className={`
                        text-3xl md:text-5xl font-bold font-theme tracking-tight mb-6
                        ${theme === 'neubrutalist' ? 'text-white' : ''}
                        ${theme === 'discord' ? 'text-white' : ''}
                    `}>
                        {CTA.title}
                    </h2>

                    <p className={`
                        text-lg md:text-xl mb-10 max-w-2xl mx-auto
                        ${theme === 'neubrutalist' ? 'text-white/90' : ''}
                        ${theme === 'discord' ? 'text-white/90' : ''}
                    `}>
                        {CTA.subtitle}
                    </p>

                    {/* CTA Button */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 mb-4 w-full sm:w-auto px-4 sm:px-0">
                        <Link href="/contact" className="w-full sm:w-auto">
                            <button className={`
                                w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 text-lg font-bold transition-all
                                ${theme === 'neubrutalist' ? 'bg-[#FFE66D] text-black border-[3px] border-black shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000]' : ''}
                                ${theme === 'discord' ? 'bg-white text-accent hover:bg-gray-100 rounded-theme' : ''}
                            `}>
                                <Calendar className="w-5 h-5" aria-hidden="true" />
                                {CTA.button} <ArrowRight className="w-5 h-5" aria-hidden="true" />
                            </button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
