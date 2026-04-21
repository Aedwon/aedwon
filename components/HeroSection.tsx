"use client";

import { motion } from "framer-motion";
import { ArrowRight, Users, Code, Sparkles } from "lucide-react";
import Link from "next/link";
import { useTheme } from "./ThemeContext";
import DiscordHeroSection from "./DiscordHeroSection";
import { HERO } from "@/lib/portfolio";

export default function HeroSection() {
    const { theme } = useTheme();

    // Render Discord-specific layout
    if (theme === 'discord') {
        return <DiscordHeroSection />;
    }

    if (theme === 'minimalist') {
        return (
            <section className="px-6 md:px-12 lg:px-24 py-24 md:py-32 lg:py-40 bg-paper text-ink">
                <div className="max-w-5xl mx-auto">
                    <div className="font-mono text-micro tracking-widest uppercase text-accent mb-6">
                        § 00 — A STUDIO OF ONE
                    </div>
                    <h1 className="font-serif font-bold tracking-tight text-h1 md:text-display leading-[1.05]">
                        A brand sells twice: once to the stranger, once to the regular.
                        <span className="block italic">I build for both sales.</span>
                    </h1>
                    <p className="mt-8 text-h3 max-w-3xl opacity-80 leading-snug">
                        Web solutions that make strangers pick you. Community systems that make regulars stay. Both together, if that&apos;s what the work needs.
                    </p>
                    <div className="mt-12 flex flex-col sm:flex-row gap-4">
                        <Link href="/web-solutions" className="inline-flex items-center gap-2 border border-ink px-6 py-3 font-sans text-body hover:bg-ink hover:text-paper transition-colors">
                            The stranger sale →
                        </Link>
                        <Link href="/community-solutions" className="inline-flex items-center gap-2 border border-ink px-6 py-3 font-sans text-body hover:bg-ink hover:text-paper transition-colors">
                            The regular sale →
                        </Link>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <div className="flex flex-col min-h-[calc(100vh-var(--nav-height))] w-full overflow-hidden bg-background transition-colors duration-300">

            {/* Personal Intro Section */}
            <div className={`
                flex flex-col items-center justify-center pt-24 pb-16 px-6 text-center z-10
                ${theme === 'neubrutalist' ? 'border-b-[3px] border-black bg-[#FFFDF5]' : 'border-b border-theme bg-background'}
            `}>
                <motion.div>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-theme tracking-tight mb-6 max-w-4xl">
                        A brand sells twice.<br />
                        Once to the <span className="text-accent underline decoration-4 underline-offset-4">stranger</span>,<br />
                        once to the <span className="text-accent underline decoration-4 underline-offset-4">regular</span>.<br />
                        <span className="italic opacity-80">I build for both sales.</span>
                    </h1>
                    <p className="text-base md:text-lg lg:text-xl opacity-70 max-w-2xl mx-auto mb-8 px-4 md:px-0">
                        {HERO.subtitle}
                    </p>
                </motion.div>
            </div>

            {/* Split Service Section */}
            <div className="flex flex-col md:flex-row flex-grow w-full">

                {/* Acquisition / Web Solutions Side */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className={`
                        group relative flex-1 flex flex-col items-center justify-center px-6 py-12 md:px-12 md:py-20
                        bg-background text-foreground transition-colors duration-300
                        border-b md:border-b-0 md:border-r border-theme
                        hover:bg-accent/5
                    `}
                >
                    <div className="max-w-md flex flex-col items-start gap-6">
                        <div className="p-4 rounded-theme border border-theme bg-background shadow-theme">
                            <Code className="w-8 h-8 text-accent" />
                        </div>

                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold font-theme tracking-tight mb-2">
                                The stranger sale.
                            </h2>
                            <div className="text-sm font-bold uppercase opacity-60 tracking-wider">Web Solutions</div>
                        </div>

                        <p className="text-lg opacity-80 font-medium">
                            {HERO.webPanel.headline}
                        </p>

                        <div className="flex flex-col gap-2 text-sm opacity-70">
                            {HERO.webPanel.bullets.map((bullet) => (
                                <span key={bullet} className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" /> {bullet}
                                </span>
                            ))}
                        </div>

                        <Link href="/web-solutions" className={`
                                w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 text-base font-bold transition-all mt-4
                                ${theme === 'neubrutalist' ? 'bg-accent text-black border-[3px] border-black shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] rounded-none' : ''}
                            `}>
                            {HERO.webPanel.cta}
                        </Link>
                    </div>
                </motion.div>

                {/* Retention / Community Systems Side */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className={`
                        group relative flex-1 flex flex-col items-center justify-center px-6 py-12 md:px-12 md:py-20
                        bg-background text-foreground transition-colors duration-300
                        hover:bg-accent/5
                    `}
                >
                    <div className="max-w-md flex flex-col items-start gap-6">
                        <div className="p-4 rounded-theme border border-theme bg-background shadow-theme">
                            <Users className="w-8 h-8 text-accent" />
                        </div>

                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold font-theme tracking-tight mb-2">
                                The regular sale.
                            </h2>
                            <div className="text-sm font-bold uppercase opacity-60 tracking-wider">Community Solutions</div>
                        </div>

                        <p className="text-lg opacity-80 font-medium">
                            {HERO.communityPanel.headline}
                        </p>

                        <div className="flex flex-col gap-2 text-sm opacity-70">
                            {HERO.communityPanel.bullets.map((bullet) => (
                                <span key={bullet} className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" /> {bullet}
                                </span>
                            ))}
                        </div>

                        <Link href="/community-solutions" className={`
                                w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 text-base font-bold transition-all mt-4
                                ${theme === 'neubrutalist' ? 'bg-white text-black border-[3px] border-black shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] rounded-none' : ''}
                            `}>
                            {HERO.communityPanel.cta}
                        </Link>
                    </div>
                </motion.div>

            </div>
        </div>
    );
}
