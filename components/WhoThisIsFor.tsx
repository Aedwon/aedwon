"use client";

import { useTheme } from "./ThemeContext";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { SectionMarker } from "./SectionMarker";
import { SECTION_HEADINGS } from "@/lib/portfolio";

const GOOD_FIT = [
    "You're launching something and you want it to land.",
    "You've got a community and retention is the hard problem, not growth.",
    "You care about craft and you can tell the difference.",
    "You want one person who owns the work, not a rotating team.",
    "You'd rather pay once for something right than three times for something nearly.",
];

const NOT_A_FIT = [
    "You need it yesterday. Good work doesn't fit there.",
    "You want the cheapest option on the market. That's not what I do.",
    "You want a big agency with account managers. I'm a studio of one.",
    "You haven't figured out what the thing is yet. Come back when you have.",
];

export default function WhoThisIsFor() {
    const { theme } = useTheme();

    if (theme === 'minimalist') {
        return (
            <section className="px-6 md:px-12 lg:px-24 py-24 border-t border-rule bg-paper text-ink">
                <div className="max-w-6xl mx-auto">
                    <SectionMarker number="05" label="WHO THIS IS FOR" />
                    <h2 className="font-serif text-h2 md:text-h1 font-bold tracking-tight leading-tight max-w-3xl">
                        Short list. Pick yourself off of it, or don&apos;t.
                    </h2>
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
                        <div>
                            <div className="font-mono text-micro tracking-widest uppercase opacity-70 mb-6 pb-3 border-b border-rule">
                                Right fit
                            </div>
                            <ul className="flex flex-col gap-5">
                                {GOOD_FIT.map((item, i) => (
                                    <li key={i} className="flex items-start gap-4 text-body opacity-85 leading-relaxed">
                                        <span className="font-mono text-small opacity-50 shrink-0 mt-0.5">+</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <div className="font-mono text-micro tracking-widest uppercase opacity-70 mb-6 pb-3 border-b border-rule">
                                Probably not
                            </div>
                            <ul className="flex flex-col gap-5">
                                {NOT_A_FIT.map((item, i) => (
                                    <li key={i} className="flex items-start gap-4 text-body opacity-85 leading-relaxed">
                                        <span className="font-mono text-small opacity-50 shrink-0 mt-0.5">−</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
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
                        {SECTION_HEADINGS.whoThisIsFor.title}
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Good Fit */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className={`
                            p-8
                            ${theme === 'neubrutalist' ? 'bg-[#90EE90] border-[3px] border-black shadow-[4px_4px_0px_#000]' : ''}
                            ${theme === 'discord' ? 'bg-[#2f3136] rounded-lg border-l-4 border-l-[#57F287]' : ''}
                        `}
                    >
                        <h3 className={`
                            text-xl font-bold font-theme mb-6 flex items-center gap-2
                            ${theme === 'neubrutalist' ? 'text-black' : ''}
                        `}>
                            <span className={`
                                p-1 rounded-full
                                ${theme === 'neubrutalist' ? 'bg-white border-2 border-black' : ''}
                                ${theme === 'discord' ? 'bg-green-500/20 text-green-400' : ''}
                            `}>
                                <Check className="w-5 h-5" />
                            </span>
                            {SECTION_HEADINGS.whoThisIsFor.rightFitLabel}
                        </h3>
                        <ul className="space-y-4">
                            {GOOD_FIT.map((item, i) => (
                                <motion.li
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.05 }}
                                    className={`
                                        flex items-start gap-3 text-sm
                                        ${theme === 'neubrutalist' ? 'text-black/80' : 'opacity-80'}
                                    `}
                                >
                                    <Check className={`
                                        w-4 h-4 mt-0.5 shrink-0
                                        ${theme === 'neubrutalist' ? 'text-green-800' : ''}
                                        ${theme === 'discord' ? 'text-green-400' : ''}
                                    `} />
                                    {item}
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Not a Fit */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className={`
                            p-8
                            ${theme === 'neubrutalist' ? 'bg-[#FFB3BA] border-[3px] border-black shadow-[4px_4px_0px_#000]' : ''}
                            ${theme === 'discord' ? 'bg-[#2f3136] rounded-lg border-l-4 border-l-[#ED4245]' : ''}
                        `}
                    >
                        <h3 className={`
                            text-xl font-bold font-theme mb-6 flex items-center gap-2
                            ${theme === 'neubrutalist' ? 'text-black' : ''}
                        `}>
                            <span className={`
                                p-1 rounded-full
                                ${theme === 'neubrutalist' ? 'bg-white border-2 border-black' : ''}
                                ${theme === 'discord' ? 'bg-red-500/20 text-red-400' : ''}
                            `}>
                                <X className="w-5 h-5" />
                            </span>
                            {SECTION_HEADINGS.whoThisIsFor.probablyNotLabel}
                        </h3>
                        <ul className="space-y-4">
                            {NOT_A_FIT.map((item, i) => (
                                <motion.li
                                    key={i}
                                    initial={{ opacity: 0, x: 10 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.05 }}
                                    className={`
                                        flex items-start gap-3 text-sm
                                        ${theme === 'neubrutalist' ? 'text-black/80' : 'opacity-80'}
                                    `}
                                >
                                    <X className={`
                                        w-4 h-4 mt-0.5 shrink-0
                                        ${theme === 'neubrutalist' ? 'text-red-800' : ''}
                                        ${theme === 'discord' ? 'text-red-400' : ''}
                                    `} />
                                    {item}
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
