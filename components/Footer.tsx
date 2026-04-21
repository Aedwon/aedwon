"use client";

import { useTheme } from "./ThemeContext";
import { Github, Linkedin } from "lucide-react";
import Link from "next/link";

import Logo from "./Logo";
import { Colophon } from "./Colophon";
import { BRANDING, FOOTER } from "@/lib/portfolio";

export default function Footer() {
    const { theme } = useTheme();

    return (
        <footer className={`
            w-full transition-colors duration-300
            ${theme === 'minimalist' ? 'bg-paper border-t border-rule py-16' : ''}
            ${theme === 'neubrutalist' ? 'bg-black text-white py-12 border-t-[3px] border-black' : ''}
            ${theme === 'discord' ? 'bg-[#2f3136] py-8 border-t border-[#202225]' : ''}
        `}>
            <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">

                {theme === 'minimalist' ? (
                    <div className="flex flex-col gap-10">
                        {/* Top row — wordmark + colophon */}
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
                            <div className="flex flex-col gap-3 max-w-md">
                                <div className="flex items-center gap-2">
                                    <Logo className="w-8 h-8" />
                                    <h3 className="text-xl font-serif font-bold tracking-tight">
                                        {BRANDING.name}
                                    </h3>
                                </div>
                                <Colophon />
                            </div>

                            <nav aria-label="Social media links" className="flex items-center gap-6 shrink-0">
                                <Link href="https://github.com/Aedwon" target="_blank" rel="noopener noreferrer" aria-label="Visit GitHub profile" className="hover:text-accent transition-colors">
                                    <Github className="w-5 h-5" aria-hidden="true" />
                                </Link>
                                <Link href="https://www.linkedin.com/in/aedwon/" target="_blank" rel="noopener noreferrer" aria-label="Visit LinkedIn profile" className="hover:text-accent transition-colors">
                                    <Linkedin className="w-5 h-5" aria-hidden="true" />
                                </Link>
                            </nav>
                        </div>

                        {/* Bottom row — credits */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-6 border-t border-rule text-micro tracking-wider uppercase opacity-70 font-mono">
                            <p>{FOOTER.copyright}</p>
                            <p>{FOOTER.credits}</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        {/* Brand / Logo Area */}
                        <div className="flex flex-col items-center md:items-start gap-3">
                            <div className="flex items-center gap-2">
                                <Logo className="w-8 h-8" />
                                <h3 className={`
                                    text-lg font-bold font-theme tracking-tight
                                    ${theme === 'neubrutalist' ? 'uppercase tracking-widest text-accent' : ''}
                                `}>
                                    {BRANDING.name}
                                </h3>
                            </div>
                            <p className={`
                                text-sm opacity-80 flex items-center gap-1
                                ${theme === 'discord' ? 'text-xs uppercase font-bold text-accent' : ''}
                            `}>
                                {theme === 'neubrutalist' && "NO TEMPLATES // ALL CODE"}
                                {theme === 'discord' && <> <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Aedwon is online</>}
                            </p>
                        </div>

                        <nav aria-label="Social media links" className="flex items-center gap-6">
                            <Link href="https://github.com/Aedwon" target="_blank" rel="noopener noreferrer" aria-label="Visit GitHub profile" className="hover:text-accent transition-colors">
                                <Github className="w-5 h-5" aria-hidden="true" />
                            </Link>
                            <Link href="https://www.linkedin.com/in/aedwon/" target="_blank" rel="noopener noreferrer" aria-label="Visit LinkedIn profile" className="hover:text-accent transition-colors">
                                <Linkedin className="w-5 h-5" aria-hidden="true" />
                            </Link>
                        </nav>

                        <div className={`
                            text-xs opacity-70 font-theme text-center md:text-right
                            ${theme === 'neubrutalist' ? 'opacity-90 font-bold' : ''}
                        `}>
                            <p>{FOOTER.copyright}. {FOOTER.allRightsReserved}</p>
                            {theme === 'neubrutalist' && <p>MADE IN VS CODE</p>}
                            {theme === 'discord' && <p className="flex items-center gap-1 justify-end">v1.0.0 <span className="w-1.5 h-1.5 rounded-full bg-accent"></span> Stable</p>}
                        </div>
                    </div>
                )}
            </div>
        </footer>
    );
}
