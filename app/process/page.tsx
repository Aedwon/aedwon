"use client";

import { useTheme } from "@/components/ThemeContext";
import { StateLabel } from "@/components/StateLabel";
import { motion } from "framer-motion";
import { Search, FileText, Code2, Rocket, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";
import { STEPS, SECTION_HEADINGS, CONTACT } from "@/lib/portfolio";

const STEP_ICONS = [Search, FileText, Code2, Rocket, TrendingUp];
import type React from "react";


export default function ProcessPage() {
    const { theme } = useTheme();

    return (
        <main className="min-h-screen px-6 py-16 md:px-12 md:py-24 lg:px-24 bg-background transition-colors duration-300">

            <div className="max-w-4xl mx-auto">
                <div className="mb-16 text-center">
                    <p className={`text-sm font-bold uppercase tracking-widest mb-4 ${theme === 'discord' ? 'text-accent' : 'opacity-60'}`}>
                        § 00 — HOW I WORK
                    </p>
                    <h1 className={`text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 ${theme === 'minimalist' ? 'font-serif' : 'font-theme'}`}>
                        {SECTION_HEADINGS.howItWorks.title}
                    </h1>
                    <p className="opacity-80 text-lg max-w-2xl mx-auto">
                        {SECTION_HEADINGS.howItWorks.subtitle}
                    </p>
                </div>

                <div className="relative">
                    {/* Connecting Line */}
                    <div className={`
                absolute left-8 md:left-1/2 top-4 bottom-0 -ml-[1px]
                ${theme === 'minimalist' ? 'w-px bg-rule' : 'w-0.5'}
                ${theme === 'neubrutalist' ? 'w-2 -ml-1 bg-black' : ''}
                ${theme === 'discord' ? 'bg-accent/30 w-1 -ml-0.5' : ''}
            `} />

                    <div className="flex flex-col gap-12 md:gap-20">
                        {STEPS.map((step, index) => {
                            const isEven = index % 2 === 0;
                            return (
                                <motion.div
                                    key={step.id}
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className={`relative flex items-start md:justify-between gap-8 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                                >
                                    {/* Icon / Marker */}
                                    <div className={`
                                absolute left-8 md:left-1/2 -ml-6 md:-ml-6 z-10 w-12 h-12 flex items-center justify-center
                                ${theme === 'minimalist' ? 'bg-paper border border-ink rounded-full' : ''}
                                ${theme === 'neubrutalist' ? 'bg-accent border-[3px] border-black shadow-[4px_4px_0px_#000] z-20' : ''}
                                ${theme === 'discord' ? 'bg-accent-secondary rounded-full border-2 border-accent text-accent' : ''}
                            `}>
                                        {theme === 'minimalist' ? (
                                            <span className="font-mono text-small font-medium leading-none">
                                                {String(step.id).padStart(2, '0')}
                                            </span>
                                        ) : (() => {
                                            const Icon = STEP_ICONS[index];
                                            return <Icon className={`w-5 h-5 ${theme === 'neubrutalist' ? 'text-black' : ''}`} />;
                                        })()}
                                    </div>

                                    {/* Content Side */}
                                    <div className={`
                                w-full md:w-[calc(50%-3rem)] ml-20 md:ml-0
                                p-6
                                ${theme === 'minimalist' ? 'border border-theme hover:border-foreground transition-colors' : ''}
                                ${theme === 'neubrutalist' ? 'bg-white border-[3px] border-black shadow-[4px_4px_0px_#000]' : ''}
                                ${theme === 'discord' ? 'bg-accent-secondary rounded-lg border border-[#202225]' : ''}
                            `}>
                                        <div className={`
                                    flex items-center gap-2 mb-3
                                    ${theme === 'minimalist' ? 'text-accent' : ''}
                                `}>
                                            {theme === 'minimalist' && (() => {
                                                const Icon = STEP_ICONS[index];
                                                return <Icon className="w-4 h-4 opacity-80" aria-hidden="true" />;
                                            })()}
                                            <span className={`
                                                text-xs font-bold uppercase
                                                ${theme === 'minimalist' ? 'font-mono tracking-widest' : ''}
                                                ${theme === 'neubrutalist' ? 'bg-black text-white inline-block px-2 py-0.5' : ''}
                                                ${theme === 'discord' ? 'text-accent' : ''}
                                            `}>
                                                § 0{step.id} — {step.subtitle}
                                            </span>
                                        </div>
                                        <h3 className={`text-2xl font-bold mb-3 ${theme === 'minimalist' ? 'font-serif' : 'font-theme'}`}>{step.title}</h3>
                                        <p className="opacity-80 mb-4">{step.description}</p>
                                        <div className={`
                                            text-sm font-medium p-3
                                            ${theme === 'minimalist' ? 'border-l-2 border-ink pl-4' : 'rounded-lg'}
                                            ${theme === 'neubrutalist' ? 'bg-[#B8F2E6] border-2 border-black' : ''}
                                            ${theme === 'discord' ? 'bg-[#202225] border-l-4 border-l-accent' : ''}
                                        `}>
                                            <strong>Outcome:</strong> {step.outcome}
                                        </div>
                                        {step.footnote && (
                                            <p className="mt-3 text-xs italic opacity-60 leading-relaxed">
                                                {step.footnote}
                                            </p>
                                        )}
                                    </div>

                                    {/* Empty space for the other side on desktop */}
                                    <div className="hidden md:block w-[calc(50%-3rem)]" />
                                </motion.div>
                            );
                        })}
                    </div>

                </div>

                {/* CTA at bottom */}
                <div className={`
                    mt-24 text-center p-8
                    ${theme === 'minimalist' ? 'border-t border-rule pt-16' : 'rounded-lg border border-theme'}
                    ${theme === 'neubrutalist' ? 'bg-accent border-[3px] border-black shadow-[4px_4px_0px_#000]' : ''}
                    ${theme === 'discord' ? 'bg-accent' : ''}
                `}>
                    <p className={`text-sm font-bold uppercase tracking-widest mb-4 ${theme === 'minimalist' ? 'font-mono opacity-70' : theme === 'discord' ? 'text-accent' : 'opacity-60'}`}>
                        § 06 — START
                    </p>
                    <h3 className={`text-3xl md:text-4xl font-bold mb-4 ${theme === 'minimalist' ? 'font-serif' : 'font-theme'} ${theme !== 'minimalist' ? 'text-white' : ''}`}>
                        {CONTACT.call.headline}
                    </h3>
                    <p className={`mb-6 max-w-xl mx-auto ${theme === 'minimalist' ? 'opacity-70' : 'text-white/80'}`}>
                        {CONTACT.call.headline}
                    </p>
                    <Link href="/contact" className="w-full sm:w-auto">
                        <button className={`
                            w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold transition-all
                            ${theme === 'minimalist' ? 'bg-accent text-paper hover:opacity-90' : ''}
                            ${theme === 'neubrutalist' ? 'bg-white text-black border-[3px] border-black shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000]' : ''}
                            ${theme === 'discord' ? 'bg-white text-accent hover:bg-gray-100 rounded-lg' : ''}
                        `}>
                            {CONTACT.call.button} <ArrowRight className="w-5 h-5" aria-hidden="true" />
                        </button>
                    </Link>
                    {theme === 'minimalist' && (
                        <div className="mt-8 flex justify-center">
                            <StateLabel />
                        </div>
                    )}
                </div>

            </div>
        </main>
    );
}
