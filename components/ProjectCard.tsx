"use client";

import Image from "next/image";

interface ProjectCardProps {
    title: string;
    labels: string[];
    description: string;
    url?: string;
    cta?: string;
    image?: string;
}

export function ProjectCard({ title, labels, description, url, cta, image }: ProjectCardProps) {
    const ctaLabel = cta ?? (url ? "Visit →" : null);

    const content = (
        <div className="group border border-rule hover:border-ink transition-colors flex flex-col h-full overflow-hidden">
            {image && (
                <div className="relative w-full h-48 border-b border-rule bg-paper overflow-hidden">
                    <Image
                        src={image}
                        alt={title}
                        fill
                        className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                </div>
            )}
            <div className="p-8 flex flex-col gap-4 flex-grow">
                <div className="font-mono text-micro tracking-widest uppercase opacity-60 flex flex-wrap gap-x-3 gap-y-1">
                    {labels.map((l, i) => (
                        <span key={i}>{l}{i < labels.length - 1 && " ·"}</span>
                    ))}
                </div>
                <h3 className="font-serif text-h3 font-bold leading-tight">{title}</h3>
                <p className="text-small opacity-80 leading-relaxed">{description}</p>
                {ctaLabel && (
                    <span className="mt-auto pt-4 text-small opacity-70 group-hover:text-accent transition-colors">
                        {ctaLabel}
                    </span>
                )}
            </div>
        </div>
    );

    if (url) {
        return <a href={url} target="_blank" rel="noopener noreferrer">{content}</a>;
    }
    return content;
}
