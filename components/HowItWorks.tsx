"use client";

import { useTheme } from "./ThemeContext";
import { motion } from "framer-motion";
import { SectionMarker } from "./SectionMarker";
import { SECTION_HEADINGS, STEPS } from "@/lib/portfolio";
import { Search, FileText, Code2, Rocket, TrendingUp } from "lucide-react";
import Link from "next/link";

const STEP_ICONS = [Search, FileText, Code2, Rocket, TrendingUp];


export default function HowItWorks() {
    const { theme } = useTheme();

    if (theme === 'minimalist') {
        return (
            <section className="px-6 md:px-12 lg:px-24 py-24 border-t border-rule bg-paper text-ink">
                <div className="max-w-6xl mx-auto">
                    <SectionMarker number="04" label="HOW I WORK" />
                    <h2 className="font-serif text-h2 md:text-h1 font-bold tracking-tight leading-tight max-w-3xl">
                        Five rooms. I leave the doors open.
                    </h2>
                    <p className="mt-6 text-small opacity-70 italic max-w-2xl">
                        Same five steps for web and community work. Brief version below; the full one lives on <Link className="underline underline-offset-4 decoration-rule hover:decoration-ink hover:text-accent transition-colors" href="/process">/process</Link>.
                    </p>
                    <ol className="mt-12 border-t border-rule">
                        {STEPS.map((step) => (
                            <li key={step.step} className="flex flex-col md:flex-row md:items-baseline gap-3 md:gap-10 py-6 border-b border-rule">
                                <div className="font-mono text-micro tracking-widest uppercase opacity-60 md:w-24 shrink-0">
                                    § {step.step}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-serif text-h3 font-bold leading-tight">{step.title}</h3>
                                    <p className="mt-2 text-body opacity-80 leading-relaxed max-w-2xl">{step.short}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                    <div className="mt-10">
                        <Link href="/process" className="inline-flex items-center gap-2 text-body opacity-80 hover:opacity-100 hover:text-accent transition-colors">
                            Read the full process →
                        </Link>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className={`
            py-20 px-6 md:px-12 lg:px-24 border-b border-theme transition-colors duration-300
            ${theme === 'neubrutalist' ? 'bg-[#FFFDF5] border-b-[3px] border-black' : ''}
            ${theme === 'discord' ? 'bg-[#36393f]' : ''}
        `}>
            <div className="max-w-6xl mx-auto">
                <div className="mb-16 text-center">
                    <h2 className="text-3xl md:text-5xl font-bold font-theme tracking-tight mb-4">
                        {SECTION_HEADINGS.howItWorks.title}
                    </h2>
                    <p className="opacity-70 text-lg max-w-2xl mx-auto">
                        {SECTION_HEADINGS.howItWorks.subtitle} Brief version below; the full one lives on <Link className="underline underline-offset-4 hover:text-accent transition-colors" href="/process">/process</Link>.
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-6">
                    {STEPS.map((step, i) => (
                        <motion.div
                            key={step.step}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className={`
                                relative p-5 flex flex-col gap-3
                                w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]
                                ${theme === 'neubrutalist' ? 'bg-white border-[3px] border-black shadow-[4px_4px_0px_#000]' : ''}
                                ${theme === 'discord' ? 'bg-[#2f3136] rounded-lg border-l-4 border-l-accent' : ''}
                            `}
                        >
                            <div className="flex items-center justify-between">
                                <div className={`
                                    p-2.5 rounded-theme
                                    ${theme === 'neubrutalist' ? 'bg-accent border-2 border-black' : ''}
                                    ${theme === 'discord' ? 'bg-accent text-white' : ''}
                                `}>
                                    {(() => {
                                        const Icon = STEP_ICONS[i];
                                        return <Icon className="w-4 h-4" />;
                                    })()}
                                </div>
                                <span className={`
                                    text-3xl font-bold
                                    ${theme === 'neubrutalist' ? 'opacity-30' : ''}
                                    ${theme === 'discord' ? 'text-accent/30' : ''}
                                `}>
                                    {step.step}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold font-theme">
                                {step.title}
                            </h3>

                            <p className="text-sm opacity-70 leading-relaxed">
                                {step.short}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
