"use client";

interface ProjectCardProps {
    title: string;
    labels: string[];
    description: string;
    url?: string;
    cta?: string;
}

export function ProjectCard({ title, labels, description, url, cta }: ProjectCardProps) {
    const ctaLabel = cta ?? (url ? "Visit →" : null);

    const content = (
        <div className="group border border-rule p-8 hover:border-ink transition-colors flex flex-col gap-4 h-full">
            <div className="font-mono text-micro tracking-widest uppercase opacity-60 flex flex-wrap gap-x-3 gap-y-1">
                {labels.map((l, i) => (
                    <span key={i}>{l}{i < labels.length - 1 && " ·"}</span>
                ))}
            </div>
            <h3 className="font-serif text-h3 font-bold leading-tight">{title}</h3>
            <p className="text-small opacity-80 leading-relaxed">{description}</p>
            {ctaLabel && (
                <span className="mt-auto text-small opacity-70 group-hover:text-accent transition-colors">
                    {ctaLabel}
                </span>
            )}
        </div>
    );

    if (url) {
        return <a href={url} target="_blank" rel="noopener noreferrer">{content}</a>;
    }
    return content;
}
