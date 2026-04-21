"use client";

import { motion } from "framer-motion";
import { useTheme } from "./ThemeContext";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";

interface ProjectCardProps {
    title: string;
    description: string;
    metric: string;
    tags: string[];
    image?: string;
    category?: string;
    url?: string;
}

export default function LegacyProjectCard({
    title,
    description,
    metric,
    tags,
    url,
}: ProjectCardProps) {
    const { theme } = useTheme();

    const Wrapper = url ? motion.a : motion.div;
    const linkProps = url ? { href: url, target: "_blank", rel: "noopener noreferrer" } : {};

    return (
        <Wrapper
            {...linkProps}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
            className={`
        group relative flex flex-col overflow-hidden w-full transition-all duration-300
        bg-background text-foreground
        border-theme rounded-theme shadow-theme
        ${url ? 'cursor-pointer' : ''}
        ${theme === 'neubrutalist' ? 'hover:shadow-[8px_8px_0px_0px_var(--border-color)] hover:-translate-y-1' : 'hover:border-accent'}
      `}
        >
            {/* Placeholder Image Area */}
            <div className={`
            relative w-full h-48 bg-accent-secondary flex items-center justify-center overflow-hidden border-b border-theme
        `}>
                <div className="absolute inset-0 bg-gradient-to-br from-accent-secondary to-background opacity-50" />
                <span className="text-foreground opacity-50 font-theme font-bold uppercase tracking-widest">Preview</span>
            </div>

            <div className="p-6 flex flex-col gap-4 flex-grow">
                {/* Header & Title */}
                <div className="flex justify-between items-start">
                    <h3 className="text-2xl font-bold font-theme tracking-tight leading-none group-hover:text-accent transition-colors">
                        {title}
                    </h3>
                    {url && <ArrowUpRight className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity shrink-0" aria-hidden="true" />}
                </div>

                {/* Metric Badge - The "Problem Solved" */}
                <div className={`
                self-start px-3 py-1 text-sm font-bold flex items-center gap-2 border-theme rounded-theme
                ${theme === 'minimalist' ? 'bg-accent-secondary text-foreground' : ''}
                ${theme === 'neubrutalist' ? 'bg-accent text-black border-2 border-black' : ''}
                ${theme === 'discord' ? 'bg-accent/20 text-accent border-accent/50' : ''}
            `}>
                    <CheckCircle2 className="w-4 h-4" />
                    {metric}
                </div>

                <p className="opacity-80 line-clamp-3">
                    {description}
                </p>

                {/* Tech Stack Tags */}
                <div className="mt-auto flex flex-wrap gap-2 pt-4">
                    {tags.map((tag) => (
                        <span
                            key={tag}
                            className={`
                            text-xs font-medium px-2 py-1 rounded-theme border-theme
                            bg-accent-secondary text-foreground opacity-80
                        `}
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </Wrapper>
    );
}
