"use client";

import { useTheme } from "@/components/ThemeContext";
import { SectionMarker } from "@/components/SectionMarker";
import { StateLabel } from "@/components/StateLabel";
import { ProjectCard } from "@/components/ProjectCard";
import { PricingTier } from "@/components/PricingTier";
import DashboardPreview from "@/components/DashboardPreview";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Star, CheckCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
    COMMUNITY_BOTS,
    COMMUNITY_OPS,
    COMMUNITY_TIERS,
    COMMUNITY_PAGE,
    CTA,
} from "@/lib/portfolio";

export default function CommunitySolutions() {
    const { theme } = useTheme();

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
                            {COMMUNITY_PAGE.title}
                        </h1>
                        <p className="mt-8 text-h3 max-w-3xl opacity-80 leading-snug">
                            {COMMUNITY_PAGE.subtitle}
                        </p>
                    </div>
                </section>

                {/* § 02 — BOTS & TOOLING */}
                <section className="px-6 md:px-12 lg:px-24 py-24 border-t border-rule">
                    <div className="max-w-6xl mx-auto">
                        <SectionMarker number="02" label="BOTS & TOOLING" />
                        <p className="text-small opacity-70 italic mb-10 max-w-2xl">
                            {COMMUNITY_PAGE.botsSubtitle}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {COMMUNITY_BOTS.map((bot) => (
                                <ProjectCard
                                    key={bot.title}
                                    title={bot.title}
                                    labels={bot.labels}
                                    description={bot.description}
                                    url={bot.url}
                                    image={bot.image}
                                />
                            ))}
                        </div>
                    </div>
                </section>

                {/* § 03 — COMMUNITY OPS */}
                <section className="px-6 md:px-12 lg:px-24 py-24 border-t border-rule">
                    <div className="max-w-6xl mx-auto">
                        <SectionMarker number="03" label="COMMUNITY OPS" />
                        <p className="text-small opacity-70 italic mb-10 max-w-2xl">
                            {COMMUNITY_PAGE.opsSubtitle}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {COMMUNITY_OPS.map((op) => (
                                <ProjectCard
                                    key={op.title}
                                    title={op.title}
                                    labels={op.labels}
                                    description={op.description}
                                />
                            ))}
                        </div>
                    </div>
                </section>

                {/* § 04 — CRAFT DEMO */}
                <section className="px-6 md:px-12 lg:px-24 py-24 border-t border-rule">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
                            <SectionMarker number="04" label="CRAFT DEMO" />
                            <span className="font-mono text-micro tracking-widest uppercase opacity-60">LIVE · INTERNAL TOOL</span>
                        </div>
                        <p className="text-small opacity-70 italic mb-8">
                            This is the kind of panel I&apos;d build you. Data here is illustrative.
                        </p>
                        <DashboardPreview />
                    </div>
                </section>

                {/* § 05 — WHAT I HANDLE */}
                <section className="px-6 md:px-12 lg:px-24 py-24 border-t border-rule">
                    <div className="max-w-5xl mx-auto">
                        <SectionMarker number="05" label="WHAT I HANDLE" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-6">
                            {COMMUNITY_PAGE.whatIHandle.map((item) => (
                                <div key={item.title} className="flex flex-col gap-4">
                                    <h3 className="font-serif text-h3 font-bold">{item.title}</h3>
                                    <p className="text-body opacity-80 leading-relaxed">{item.body}</p>
                                </div>
                            ))}
                        </div>
                        <p className="mt-12 text-small italic text-accent max-w-3xl">
                            {COMMUNITY_PAGE.whatIHandleFootnote}
                        </p>
                    </div>
                </section>

                {/* § 06 — PRICING */}
                <section className="px-6 md:px-12 lg:px-24 py-24 border-t border-rule">
                    <div className="max-w-6xl mx-auto">
                        <SectionMarker number="06" label="PRICING" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {COMMUNITY_TIERS.map((tier) => (
                                <PricingTier
                                    key={tier.name}
                                    name={tier.name}
                                    price={`${tier.pricePrefix ? tier.pricePrefix + " " : ""}${tier.price}${tier.priceSuffix ? " " + tier.priceSuffix : ""}`}
                                    copy={tier.description}
                                />
                            ))}
                        </div>
                        <p className="mt-10 text-small opacity-60 italic">
                            {COMMUNITY_PAGE.pricingFootnote}
                        </p>
                    </div>
                </section>

                {/* § 07 — START */}
                <section className="px-6 md:px-12 lg:px-24 py-24 md:py-32 border-t border-rule text-center">
                    <div className="max-w-3xl mx-auto">
                        <SectionMarker number="07" label="START" />
                        <p className="font-serif text-h2 leading-tight mb-8 mt-6">
                            {COMMUNITY_PAGE.ctaSubtitle}
                        </p>
                        <Link href="/contact" className="inline-flex items-center gap-2 bg-accent text-paper px-8 py-4 font-sans text-body hover:opacity-90 transition-opacity">
                            {COMMUNITY_PAGE.ctaButton} →
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
                        <div className="flex items-center gap-3 mb-4">
                            <p className={`text-sm font-bold uppercase tracking-widest ${theme === 'discord' ? 'text-accent' : 'opacity-60'}`}>
                                {COMMUNITY_PAGE.kicker}
                            </p>
                            <div className={`
                                px-3 py-1 text-xs font-bold flex items-center gap-2
                                ${theme === 'neubrutalist' ? 'bg-[#57F287] text-black border-2 border-black shadow-[2px_2px_0px_#000]' : ''}
                                ${theme === 'discord' ? 'bg-[#57F287]/20 text-[#57F287] rounded-full' : ''}
                            `}>
                                <div className="w-2 h-2 rounded-full bg-[#57F287] animate-pulse"></div>
                                Available Now
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-theme tracking-tight mb-6">
                            {COMMUNITY_PAGE.title}
                        </h1>
                        <p className="text-xl md:text-2xl opacity-80 leading-relaxed font-theme max-w-3xl mb-8">
                            {COMMUNITY_PAGE.subtitle}
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <Link href="/contact">
                                <button className={`
                                    flex items-center gap-2 px-8 py-4 text-base font-bold transition-all
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

            {/* Community Portfolio / Trusted By */}
            <section className={`
                px-6 py-12 border-y border-theme
                ${theme === 'discord' ? 'bg-[#202225]' : 'bg-accent-secondary/5'}
            `}>
                <div className="max-w-7xl mx-auto text-center">
                    <p className={`text-sm font-bold uppercase tracking-widest mb-8 ${theme === 'discord' ? 'text-gray-400' : 'opacity-60'}`}>
                        {COMMUNITY_PAGE.trustStatement}
                    </p>
                    <div className="flex flex-wrap justify-center gap-12 md:gap-16 items-center">
                        <div className="relative h-16 w-48 transition-transform hover:scale-105">
                            <Image
                                src="/brands/mlbb-logo.png"
                                alt="Mobile Legends: Bang Bang"
                                fill
                                className="object-contain"
                            />
                        </div>
                        <div className="relative h-36 w-96 transition-transform hover:scale-105 overflow-hidden flex items-center justify-center">
                            <Image
                                src="/brands/genshin-logo.png"
                                alt="Genshin Impact"
                                fill
                                className={`object-contain scale-[1.4] ${theme === 'discord' ? 'brightness-[0] invert' : ''}`}
                            />
                        </div>
                        <div className="relative h-12 w-48 transition-transform hover:scale-105">
                            <Image
                                src="/brands/blue-protocol-logo.png"
                                alt="Blue Protocol: Star Resonance"
                                fill
                                className="object-contain"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Dashboard Preview */}
            <section className={`
                px-6 py-16 md:px-12 md:py-24 lg:px-24
                ${theme === 'discord' ? 'bg-[#2f3136]' : 'bg-accent-secondary/10'}
            `}>
                <div className="mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold font-theme tracking-tight mb-4">
                        Craft demo.
                    </h2>
                    <p className="text-lg opacity-70 max-w-2xl">
                        This is the kind of panel I&apos;d build you. Data here is illustrative.
                    </p>
                </div>
                <DashboardPreview />
            </section>

            {/* Bots & Tooling */}
            <section className={`
                px-6 py-16 md:px-12 md:py-24 lg:px-24
                ${theme === 'discord' ? 'bg-[#2f3136]' : 'bg-accent-secondary/10'}
            `}>
                <div className="mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold font-theme tracking-tight mb-4">
                        {COMMUNITY_PAGE.botsHeading}
                    </h2>
                    <p className="text-lg opacity-70 max-w-2xl">
                        {COMMUNITY_PAGE.botsSubtitle}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {COMMUNITY_BOTS.map((bot, i) => {
                        const Wrapper = bot.url ? motion.a : motion.div;
                        const linkProps = bot.url ? { href: bot.url, target: "_blank", rel: "noopener noreferrer" } : {};
                        return (
                            <Wrapper
                                key={bot.title}
                                {...linkProps}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className={`
                                    group p-6 flex flex-col gap-3 transition-all
                                    ${bot.url ? 'cursor-pointer' : ''}
                                    ${theme === 'neubrutalist' ? `bg-white border-[3px] border-black shadow-[4px_4px_0px_#000] ${bot.url ? 'hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000]' : ''}` : ''}
                                    ${theme === 'discord' ? `bg-[#36393f] rounded-lg border-l-4 border-l-accent ${bot.url ? 'hover:bg-[#40444b]' : ''}` : ''}
                                `}
                            >
                                {bot.image && (
                                    <div className="relative w-full h-40 -mt-6 -mx-6 mb-4 overflow-hidden rounded-t-[inherit]">
                                        <img
                                            src={bot.image}
                                            alt={bot.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                )}
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex flex-wrap gap-2">
                                        {bot.labels.map((label) => (
                                            <span
                                                key={label}
                                                className={`
                                                    px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider
                                                    ${theme === 'neubrutalist' ? 'bg-[#FFE66D] text-black border-2 border-black' : ''}
                                                    ${theme === 'discord' ? 'bg-accent/20 text-accent rounded' : ''}
                                                `}
                                            >
                                                {label}
                                            </span>
                                        ))}
                                    </div>
                                    {bot.url && <ArrowUpRight className="w-4 h-4 opacity-60 group-hover:opacity-100 shrink-0" aria-hidden="true" />}
                                </div>
                                <h3 className="text-lg font-bold font-theme">{bot.title}</h3>
                                <p className={`text-sm ${theme === 'discord' ? 'text-gray-400' : 'opacity-70'}`}>
                                    {bot.description}
                                </p>
                            </Wrapper>
                        );
                    })}
                </div>
            </section>

            {/* Community Ops */}
            <section className="px-6 py-16 md:px-12 md:py-24 lg:px-24">
                <div className="mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold font-theme tracking-tight mb-4">
                        {COMMUNITY_PAGE.opsHeading}
                    </h2>
                    <p className="text-lg opacity-70 max-w-2xl">
                        {COMMUNITY_PAGE.opsSubtitle}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {COMMUNITY_OPS.map((op, i) => (
                        <motion.div
                            key={op.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className={`
                                p-6 flex flex-col gap-3
                                ${theme === 'neubrutalist' ? 'bg-[#B8F2E6] border-[3px] border-black shadow-[4px_4px_0px_#000]' : ''}
                                ${theme === 'discord' ? 'bg-[#2f3136] rounded-lg border-l-4 border-l-[#57F287]' : ''}
                            `}
                        >
                            <div className="flex flex-wrap gap-2">
                                {op.labels.map((label) => (
                                    <span
                                        key={label}
                                        className={`
                                            px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider
                                            ${theme === 'neubrutalist' ? 'bg-white text-black border-2 border-black' : ''}
                                            ${theme === 'discord' ? 'bg-[#57F287]/20 text-[#57F287] rounded' : ''}
                                        `}
                                    >
                                        {label}
                                    </span>
                                ))}
                            </div>
                            <h3 className={`text-lg font-bold font-theme ${theme === 'neubrutalist' ? 'text-black' : ''}`}>{op.title}</h3>
                            <p className={`text-sm ${theme === 'neubrutalist' ? 'text-black/80' : theme === 'discord' ? 'text-gray-400' : 'opacity-70'}`}>
                                {op.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* What I Handle */}
            <section className={`
                px-6 py-16 md:px-12 md:py-24 lg:px-24 border-y border-theme
                ${theme === 'discord' ? 'bg-[#2f3136]' : 'bg-accent-secondary/20'}
            `}>
                <div className="max-w-5xl mx-auto">
                    <div className="mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold font-theme tracking-tight mb-4">
                            {COMMUNITY_PAGE.whatIHandleHeading}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {COMMUNITY_PAGE.whatIHandle.map((item, i) => (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className={`
                                    p-6 flex flex-col gap-3
                                    ${theme === 'neubrutalist' ? 'bg-white border-[3px] border-black shadow-[4px_4px_0px_#000]' : ''}
                                    ${theme === 'discord' ? 'bg-[#36393f] rounded-lg' : ''}
                                `}
                            >
                                <h3 className="text-xl font-bold font-theme">{item.title}</h3>
                                <p className={`text-sm ${theme === 'discord' ? 'text-gray-400' : 'opacity-80'}`}>
                                    {item.body}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                    <p className="mt-8 text-sm italic opacity-70 max-w-3xl">
                        {COMMUNITY_PAGE.whatIHandleFootnote}
                    </p>
                </div>
            </section>

            {/* Pricing */}
            <section className="px-6 py-16 md:px-12 md:py-24 lg:px-24">
                <div className="mb-12 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold font-theme tracking-tight mb-4">
                        {COMMUNITY_PAGE.pricingHeading}
                    </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto items-start">
                    {COMMUNITY_TIERS.map((tier, i) => (
                        <motion.div
                            key={tier.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className={`
                                relative p-8 flex flex-col h-full
                                ${theme === 'neubrutalist' ? `bg-white border-[3px] border-black shadow-[4px_4px_0px_#000] ${tier.popular ? 'bg-[#FFE66D] lg:-translate-y-4 shadow-[6px_6px_0px_#000] z-10' : ''}` : ''}
                                ${theme === 'discord' ? `rounded-lg ${tier.popular ? 'bg-accent/10 border-2 border-accent lg:-translate-y-4 z-10' : 'bg-[#2f3136]'}` : ''}
                            `}
                        >
                            {tier.popular && (
                                <div className={`
                                    absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-bold uppercase whitespace-nowrap
                                    ${theme === 'neubrutalist' ? 'bg-black text-white' : ''}
                                    ${theme === 'discord' ? 'bg-accent text-white rounded-full' : ''}
                                `}>
                                    <Star className="w-3 h-3 inline mr-1" aria-hidden="true" /> Most Popular
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
                                        <CheckCircle className={`w-4 h-4 mt-0.5 shrink-0 ${theme === 'discord' ? 'text-[#57F287]' : 'text-green-600'}`} aria-hidden="true" />
                                        <span className="opacity-80">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link href="/contact" className="w-full mt-auto">
                                <button className={`
                                    w-full flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold transition-all
                                    ${theme === 'neubrutalist' ? `${tier.popular ? 'bg-black text-white hover:opacity-80' : 'bg-white border-2 border-black hover:bg-gray-100'}` : ''}
                                    ${theme === 'discord' ? `${tier.popular ? 'bg-accent text-white' : 'bg-[#36393f] text-white hover:bg-[#40444b]'} rounded-lg` : ''}
                                `}>
                                    {tier.cta} <ArrowRight className="w-4 h-4" aria-hidden="true" />
                                </button>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-8 text-center">
                    <p className="text-xs opacity-50 italic">
                        {COMMUNITY_PAGE.pricingFootnote}
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
                        {COMMUNITY_PAGE.ctaHeading}
                    </h2>
                    <p className="text-lg mb-8 text-white/80">
                        {COMMUNITY_PAGE.ctaSubtitle}
                    </p>
                    <Link href="/contact">
                        <button className={`
                            inline-flex items-center gap-2 px-8 py-4 text-base font-bold transition-all
                            ${theme === 'neubrutalist' ? 'bg-white text-black border-[3px] border-black shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000]' : ''}
                            ${theme === 'discord' ? 'bg-white text-accent hover:bg-gray-100 rounded-lg' : ''}
                        `}>
                            {COMMUNITY_PAGE.ctaButton} <ArrowRight className="w-5 h-5" aria-hidden="true" />
                        </button>
                    </Link>
                </div>
            </section>

        </main>
    );
}
