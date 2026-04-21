"use client";

import { useState } from "react";
import LegacyProjectCard from "@/components/LegacyProjectCard";
import { ProjectCard } from "@/components/ProjectCard";
import { PricingTier } from "@/components/PricingTier";
import { useTheme } from "@/components/ThemeContext";
import { SectionMarker } from "@/components/SectionMarker";
import { StateLabel } from "@/components/StateLabel";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";
import { WEB_PROJECTS, WEB_CATEGORIES, WEB_TIERS, WEB_PAGE, CTA } from "@/lib/portfolio";

export default function WebSolutions() {
    const { theme } = useTheme();
    const [activeCategory, setActiveCategory] = useState<(typeof WEB_CATEGORIES)[number]>("All");

    const filteredProjects = activeCategory === "All"
        ? WEB_PROJECTS
        : WEB_PROJECTS.filter(p => p.category === activeCategory);

    if (theme === 'minimalist') {
        return (
            <main className="bg-paper text-ink">
                {/* § 01 — POSITION */}
                <section className="px-6 md:px-12 lg:px-24 py-24 md:py-32">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
                            <SectionMarker number="01" label="POSITION" />
                            <StateLabel />
                        </div>
                        <h1 className="font-serif font-bold tracking-tight text-h1 md:text-display leading-[1.05]">
                            {WEB_PAGE.title}
                        </h1>
                        <p className="mt-8 text-h3 max-w-3xl opacity-80 leading-snug">
                            {WEB_PAGE.subtitle}
                        </p>
                    </div>
                </section>

                <section className="px-6 md:px-12 lg:px-24 py-24 border-t border-rule">
                    <div className="max-w-6xl mx-auto">
                        <SectionMarker number="02" label="WORK" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredProjects.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    title={project.title}
                                    labels={[project.metric, ...project.tags]}
                                    description={project.description}
                                    url={project.url}
                                    image={project.image}
                                />
                            ))}
                        </div>
                        <p className="mt-12 text-small opacity-60 italic">
                            Other bot-adjacent artifacts live on <Link href="/community-solutions" className="underline hover:text-accent">community-solutions</Link> — they fit that page&apos;s framing better.
                        </p>
                    </div>
                </section>

                {/* § 03 — STANDARDS */}
                <section className="px-6 md:px-12 lg:px-24 py-24 border-t border-rule">
                    <div className="max-w-4xl mx-auto">
                        <SectionMarker number="03" label="STANDARDS" />
                        <div className="flex flex-col gap-6 font-serif text-h3 leading-snug">
                            {WEB_PAGE.standards.map((line) => (
                                <p key={line}>{line}</p>
                            ))}
                        </div>
                    </div>
                </section>

                {/* § 04 — PRICING */}
                <section className="px-6 md:px-12 lg:px-24 py-24 border-t border-rule">
                    <div className="max-w-6xl mx-auto">
                        <SectionMarker number="04" label="PRICING" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {WEB_TIERS.map((tier) => (
                                <PricingTier
                                    key={tier.name}
                                    name={tier.name}
                                    price={`${tier.pricePrefix ? tier.pricePrefix + " " : ""}${tier.price}${tier.priceSuffix ? " " + tier.priceSuffix : ""}`}
                                    copy={tier.description}
                                />
                            ))}
                        </div>
                        <p className="mt-10 text-small opacity-60 italic">
                            {WEB_PAGE.pricingFootnote}
                        </p>
                    </div>
                </section>

                {/* § 05 — START */}
                <section className="px-6 md:px-12 lg:px-24 py-24 md:py-32 border-t border-rule text-center">
                    <div className="max-w-3xl mx-auto">
                        <SectionMarker number="05" label="START" />
                        <p className="font-serif text-h2 leading-tight mb-8 mt-6">
                            {WEB_PAGE.ctaSubtitle}
                        </p>
                        <Link href="/contact" className="inline-flex items-center gap-2 bg-accent text-paper px-8 py-4 font-sans text-body hover:opacity-90 transition-opacity">
                            {WEB_PAGE.ctaButton} →
                        </Link>
                        <div className="mt-8 flex justify-center">
                            <StateLabel />
                        </div>
                    </div>
                </section>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background transition-colors duration-300">

            {/* Hero Section */}
            <section className="px-6 py-16 md:px-12 md:py-24 lg:px-24">
                <div className="max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <p className={`text-sm font-bold uppercase tracking-widest mb-4 ${theme === 'discord' ? 'text-accent' : 'opacity-60'}`}>
                            {WEB_PAGE.kicker}
                        </p>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-theme tracking-tight mb-6">
                            {WEB_PAGE.title}
                        </h1>
                        <p className="text-xl md:text-2xl opacity-80 leading-relaxed font-theme max-w-3xl mb-8">
                            {WEB_PAGE.subtitle}
                        </p>

                        <div className="flex flex-wrap gap-4 mb-8 w-full md:w-auto">
                            <Link href="/contact" className="w-full md:w-auto">
                                <button className={`
                                    w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 text-base font-bold transition-all
                                    ${theme === 'neubrutalist' ? 'bg-accent text-black border-[3px] border-black shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000]' : ''}
                                    ${theme === 'discord' ? 'bg-accent text-white hover:bg-accent/90 rounded-lg' : ''}
                                `}>
                                    {CTA.button} <ArrowRight className="w-5 h-5" aria-hidden="true" />
                                </button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Projects Section */}
            <section className="px-6 py-16 md:px-12 md:py-24 lg:px-24">
                <div className="mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold font-theme tracking-tight mb-4">
                        {WEB_PAGE.workHeading}
                    </h2>
                    <p className="text-lg opacity-70 max-w-2xl">
                        {WEB_PAGE.workSubtitle}
                    </p>
                </div>

                {/* Filter Controls */}
                <div className="flex flex-wrap gap-4 mb-12">
                    {WEB_CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`
                                px-6 py-2 text-sm font-bold transition-all relative
                                ${theme === 'neubrutalist'
                                    ? `border-[3px] border-black shadow-[4px_4px_0px_#000] hover:-translate-y-1 ${activeCategory === cat ? 'bg-accent text-black' : 'bg-white text-black'}`
                                    : ''}
                                ${theme === 'discord'
                                    ? `rounded-full ${activeCategory === cat ? 'bg-accent text-white' : 'bg-accent-secondary text-gray-400 hover:bg-[#40444b] hover:text-white'}`
                                    : ''}
                            `}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Projects Grid */}
                <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    <AnimatePresence>
                        {filteredProjects.map((project) => (
                            <LegacyProjectCard
                                key={project.id}
                                title={project.title}
                                description={project.description}
                                metric={project.metric}
                                tags={project.tags}
                                category={project.category}
                                url={project.url}
                                image={project.image}
                            />
                        ))}
                    </AnimatePresence>
                </motion.div>
            </section>

            {/* Standards Section */}
            <section className={`
                px-6 py-12 md:px-12 lg:px-24 border-y border-theme
                ${theme === 'discord' ? 'bg-[#2f3136]' : 'bg-accent-secondary/20'}
            `}>
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-bold font-theme tracking-tight mb-6">
                        {WEB_PAGE.standardsHeading}
                    </h2>
                    <div className="flex flex-col gap-4">
                        {WEB_PAGE.standards.map((line, i) => (
                            <motion.p
                                key={line}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="text-base md:text-lg opacity-80 leading-relaxed"
                            >
                                {line}
                            </motion.p>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className={`
                px-6 py-16 md:px-12 md:py-24 lg:px-24
                ${theme === 'discord' ? 'bg-[#2f3136]' : 'bg-accent-secondary/5'}
            `}>
                <div className="mb-12 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold font-theme tracking-tight mb-4">
                        {WEB_PAGE.pricingHeading}
                    </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto items-start">
                    {WEB_TIERS.map((tier, i) => (
                        <motion.div
                            key={tier.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className={`
                                p-8 flex flex-col relative h-full
                                ${theme === 'neubrutalist' ? `bg-white border-[3px] border-black shadow-[4px_4px_0px_#000] ${tier.popular ? 'bg-[#FFE66D] lg:-translate-y-4 shadow-[6px_6px_0px_#000] z-10' : ''}` : ''}
                                ${theme === 'discord' ? `rounded-lg ${tier.popular ? 'bg-accent/10 border-2 border-accent shadow-lg lg:-translate-y-4 z-10' : 'bg-[#36393f]'}` : ''}
                            `}
                        >
                            {tier.popular && (
                                <div className={`
                                    absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-bold uppercase whitespace-nowrap
                                    ${theme === 'neubrutalist' ? 'bg-black text-white' : ''}
                                    ${theme === 'discord' ? 'bg-accent text-white rounded-full' : ''}
                                `}>
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-6">
                                <p className="text-xs font-bold uppercase tracking-wider opacity-60 mb-1">{tier.tagline}</p>
                                <h3 className="text-2xl font-bold font-theme mb-2">{tier.name}</h3>
                                <div className="text-3xl font-bold font-theme mb-4 text-accent flex items-baseline flex-wrap gap-2">
                                    {tier.pricePrefix && <span className="text-base font-normal opacity-60 text-foreground">{tier.pricePrefix}</span>}
                                    <span>{tier.price}</span>
                                    {tier.priceSuffix && <span className="text-base font-normal opacity-60 text-foreground">{tier.priceSuffix}</span>}
                                </div>
                                <p className={`text-sm ${theme === 'discord' ? 'text-gray-400' : 'opacity-70'}`}>
                                    {tier.description}
                                </p>
                            </div>
                            <ul className="space-y-3 flex-grow mb-8">
                                {tier.features.map((feature, j) => (
                                    <li key={j} className="flex items-start gap-2 text-sm">
                                        <CheckCircle className={`w-4 h-4 mt-0.5 shrink-0 ${theme === 'discord' ? 'text-[#57F287]' : 'text-green-600'}`} />
                                        <span className="opacity-80">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link href="/contact" className="w-full mt-auto">
                                <button className={`
                                    w-full py-3 font-bold transition-all
                                    ${theme === 'neubrutalist' ? `${tier.popular ? 'bg-black text-white hover:opacity-80' : 'bg-white border-2 border-black hover:bg-gray-100'}` : ''}
                                    ${theme === 'discord' ? `${tier.popular ? 'bg-accent text-white' : 'bg-[#5865F2] text-white hover:bg-[#4752c4]'} rounded-md` : ''}
                                `}>
                                    {tier.cta}
                                </button>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-8 text-center">
                    <p className="text-xs opacity-50 italic">
                        {WEB_PAGE.pricingFootnote}
                    </p>
                </div>
            </section>

            {/* CTA Section */}
            <section className={`
                px-6 py-16 md:px-12 md:py-24 lg:px-24 text-center
                ${theme === 'neubrutalist' ? 'bg-accent border-t-[3px] border-black' : ''}
                ${theme === 'discord' ? 'bg-accent' : ''}
            `}>
                <div className="max-w-2xl mx-auto">
                    <h2 className={`
                        text-3xl md:text-4xl font-bold font-theme tracking-tight mb-4
                        ${theme === 'neubrutalist' || theme === 'discord' ? 'text-white' : ''}
                    `}>
                        {WEB_PAGE.ctaHeading}
                    </h2>
                    <p className="text-lg mb-8 text-white/80">
                        {WEB_PAGE.ctaSubtitle}
                    </p>
                    <Link href="/contact">
                        <button className={`
                            inline-flex items-center gap-2 px-8 py-4 text-base font-bold transition-all
                            ${theme === 'neubrutalist' ? 'bg-white text-black border-[3px] border-black shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000]' : ''}
                            ${theme === 'discord' ? 'bg-white text-accent hover:bg-gray-100 rounded-lg' : ''}
                        `}>
                            {WEB_PAGE.ctaButton} <ArrowRight className="w-5 h-5" />
                        </button>
                    </Link>
                </div>
            </section>

        </main>
    );
}
