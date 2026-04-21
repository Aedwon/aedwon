"use client";

import { useTheme } from "./ThemeContext";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { SectionMarker } from "./SectionMarker";
import { ProjectCard } from "./ProjectCard";
import { FEATURED_PROJECTS, SECTION_HEADINGS } from "@/lib/portfolio";

export default function FeaturedProjects() {
    const { theme } = useTheme();

    if (theme === 'minimalist') {
        return (
            <section className="px-6 md:px-12 lg:px-24 py-24 border-t border-rule bg-paper text-ink">
                <div className="max-w-6xl mx-auto">
                    <SectionMarker number="03" label="SELECTED WORK" />
                    <p className="text-small opacity-70 italic mb-10 max-w-2xl">
                        {SECTION_HEADINGS.featuredProjects.subtitle}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {FEATURED_PROJECTS.map((project) => (
                            <Link key={project.title} href={project.href} className="block group">
                                <ProjectCard
                                    title={project.title}
                                    labels={project.labels}
                                    description={project.description}
                                    cta={project.href === "/community-solutions" ? "See community work →" : "See web work →"}
                                    image={project.image}
                                />
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className={`
            py-20 px-6 md:px-12 lg:px-24 border-b border-theme transition-colors duration-300
            ${theme === 'neubrutalist' ? 'bg-[#B8F2E6] border-b-[3px] border-black' : ''}
            ${theme === 'discord' ? 'bg-[#2f3136]' : ''}
        `}>
            <div className="max-w-6xl mx-auto">
                <div className="mb-16 text-center">
                    <h2 className="text-3xl md:text-5xl font-bold font-theme tracking-tight mb-4">
                        {SECTION_HEADINGS.featuredProjects.title}
                    </h2>
                    <p className="opacity-70 text-lg max-w-2xl mx-auto">
                        {SECTION_HEADINGS.featuredProjects.subtitle}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {FEATURED_PROJECTS.map((project, i) => (
                        <motion.div
                            key={project.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className={`
                                group relative p-6 flex flex-col gap-4 transition-all
                                ${theme === 'neubrutalist' ? 'bg-white border-[3px] border-black shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000]' : ''}
                                ${theme === 'discord' ? 'bg-[#2f3136] rounded-lg border-l-4 border-l-accent hover:bg-[#32353b]' : ''}
                            `}
                        >
                            {project.image && (
                                <div className="relative w-full h-40 -mt-6 -mx-6 mb-4 overflow-hidden border-b border-theme rounded-t-[inherit]">
                                    <img
                                        src={project.image}
                                        alt={project.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                            )}
                            <div className="flex flex-wrap gap-2">
                                {project.labels.map((label) => (
                                    <span
                                        key={label}
                                        className={`
                                            text-xs font-bold uppercase tracking-wider px-2 py-1
                                            ${theme === 'neubrutalist' ? 'bg-black text-white' : ''}
                                            ${theme === 'discord' ? 'bg-accent/20 text-accent rounded-sm' : ''}
                                        `}
                                    >
                                        {label}
                                    </span>
                                ))}
                            </div>

                            <h3 className="text-xl font-bold font-theme">
                                {project.title}
                            </h3>

                            <p className="text-sm opacity-80 flex-grow">
                                {project.description}
                            </p>

                            <Link href={project.href} className="mt-2" aria-label={`View details for ${project.title}`}>
                                <span className={`
                                    inline-flex items-center gap-1 text-sm font-bold group-hover:gap-2 transition-all
                                    ${theme === 'discord' ? 'text-accent' : 'text-foreground'}
                                `}>
                                    {project.href === "/community-solutions" ? "See community work →" : "See web work →"}
                                    {/* <ArrowUpRight className="w-4 h-4" /> */}
                                </span>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
