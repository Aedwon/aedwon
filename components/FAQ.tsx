"use client";

import { useState } from "react";
import { useTheme } from "./ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { SectionMarker } from "./SectionMarker";
import { SECTION_HEADINGS } from "@/lib/portfolio";

const FAQS = [
    {
        question: "What if I don't like the final result?",
        answer: "Weekly demos keep us aligned. If something's off, we catch it in week two, not week six. Revisions are built in — no surprise bills.",
    },
    {
        question: "How do you handle communication?",
        answer: "You talk to me. Weekly written updates, demos embedded. Calls whenever a decision needs one. No project managers in between — because there's nobody else.",
    },
    {
        question: "What happens after launch?",
        answer: "Thirty days of post-launch support, included. After that, a monthly Care Plan or one-off tickets — whichever makes sense for what you've got.",
    },
    {
        question: "Why hire a freelancer instead of an agency?",
        answer: "The person pitching you is the person building it. Decisions happen fast and nothing gets lost in translation. Trade-off: I take one project at a time.",
    },
    {
        question: "How long does a typical project take?",
        answer: "Depends on scope. After the discovery call you get a timeline in writing. I miss deadlines rarely, and when I do you'll know ten days before, not ten days after.",
    },
    {
        question: "What's your pricing like?",
        answer: "Fixed-price, not hourly. You know the number before we start. See the tier pages for ranges — actual price comes from the scope we agree on.",
    },
];

export default function FAQ() {
    const { theme } = useTheme();
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    if (theme === 'minimalist') {
        return (
            <section className="px-6 md:px-12 lg:px-24 py-24 border-t border-rule bg-paper text-ink">
                <div className="max-w-4xl mx-auto">
                    <SectionMarker number="06" label="USUAL QUESTIONS" />
                    <h2 className="font-serif text-h2 md:text-h1 font-bold tracking-tight leading-tight">
                        A few things people ask.
                    </h2>
                    <p className="mt-6 text-small opacity-70 italic max-w-2xl">
                        If yours isn&apos;t here, the form at <Link className="underline underline-offset-4 decoration-rule hover:decoration-ink hover:text-accent transition-colors" href="/contact">/contact</Link> is open.
                    </p>
                    <ul className="mt-12 border-t border-rule">
                        {FAQS.map((faq, i) => {
                            const isOpen = openIndex === i;
                            return (
                                <li key={i} className="border-b border-rule">
                                    <button
                                        type="button"
                                        onClick={() => setOpenIndex(isOpen ? null : i)}
                                        aria-expanded={isOpen}
                                        className="w-full py-6 flex items-start justify-between gap-6 text-left hover:text-accent transition-colors"
                                    >
                                        <span className="font-serif text-h3 font-bold leading-tight pr-2">
                                            {faq.question}
                                        </span>
                                        <span className={`font-mono text-h3 shrink-0 leading-none transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`} aria-hidden="true">
                                            +
                                        </span>
                                    </button>
                                    <AnimatePresence initial={false}>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.25 }}
                                                className="overflow-hidden"
                                            >
                                                <p className="pb-6 pr-12 text-body opacity-80 leading-relaxed max-w-3xl">
                                                    {faq.answer}
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </section>
        );
    }

    return (
        <section className={`
            py-20 px-6 md:px-12 lg:px-24 border-b border-theme transition-colors duration-300
            ${theme === 'neubrutalist' ? 'bg-[#FFDEE9] border-b-[3px] border-black' : ''}
            ${theme === 'discord' ? 'bg-[#36393f]' : ''}
        `}>
            <div className="max-w-3xl mx-auto">
                <div className="mb-16 text-center">
                    <h2 className="text-3xl md:text-5xl font-bold font-theme tracking-tight mb-4">
                        {SECTION_HEADINGS.faq.title}
                    </h2>
                    <p className="opacity-70 text-lg max-w-2xl mx-auto">
                        If yours isn&apos;t here, the form at <Link href="/contact" className="underline underline-offset-4 hover:text-accent transition-colors">/contact</Link> is open.
                    </p>
                </div>

                <div className="space-y-4">
                    {FAQS.map((faq, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.05 }}
                            className={`
                                overflow-hidden transition-all
                                ${theme === 'neubrutalist' ? 'bg-white border-[3px] border-black shadow-[4px_4px_0px_#000]' : ''}
                                ${theme === 'discord' ? `bg-[#2f3136] rounded-lg ${openIndex === i ? 'border-l-4 border-l-accent' : 'border-l-4 border-l-transparent'}` : ''}
                            `}
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                className={`
                                    w-full p-6 flex items-center justify-between text-left
                                    ${theme === 'neubrutalist' ? 'hover:bg-gray-50' : ''}
                                    ${theme === 'discord' ? 'hover:bg-[#40444b]' : ''}
                                    transition-colors
                                `}
                            >
                                <span className="font-bold font-theme text-lg pr-4">
                                    {faq.question}
                                </span>
                                <ChevronDown className={`
                                    w-5 h-5 shrink-0 transition-transform duration-300
                                    ${openIndex === i ? 'rotate-180' : ''}
                                `} />
                            </button>

                            <AnimatePresence>
                                {openIndex === i && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden"
                                    >
                                        <div className={`
                                            px-6 pb-6 text-sm leading-relaxed opacity-80
                                            ${theme === 'neubrutalist' ? 'border-t-2 border-black pt-4' : 'border-t border-theme/50 pt-4'}
                                        `}>
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
