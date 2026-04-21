"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme, THEME_LABELS } from "./ThemeContext";
import { Briefcase, Zap, Gamepad2, Menu, X, ChevronDown, Home, Hash, Mail } from "lucide-react";

import Logo from "./Logo";
import { BRANDING, NAV_LINKS } from "@/lib/portfolio";

export default function Navbar() {
    const { theme, setTheme } = useTheme();

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    // Trigger attention animation every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setIsAnimating(true);
            // Stop animation after 1.5 seconds
            setTimeout(() => setIsAnimating(false), 1500);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    // Get animation class based on current theme
    const getAnimationClass = () => {
        if (!isAnimating) return '';
        switch (theme) {
            case 'minimalist':
                return 'theme-toggle-pulse-minimalist';
            case 'neubrutalist':
                return 'theme-toggle-wiggle';
            case 'discord':
                return 'theme-toggle-bounce-discord';
            default:
                return '';
        }
    };

    // Discord theme renders a simplified title bar (navigation is in sidebar)
    if (theme === 'discord') {
        return (
            <>
                <style jsx global>{`
                    @keyframes bounceDiscord {
                        0%, 100% { 
                            transform: translateY(0);
                            box-shadow: 0 0 0 0 rgba(88, 101, 242, 0);
                        }
                        10%, 30%, 50% { 
                            transform: translateY(-4px);
                            box-shadow: 0 4px 20px 4px rgba(88, 101, 242, 0.4);
                        }
                        20%, 40% { 
                            transform: translateY(0);
                            box-shadow: 0 0 10px 2px rgba(88, 101, 242, 0.2);
                        }
                        60% {
                            transform: translateY(-2px);
                            box-shadow: 0 2px 10px 2px rgba(88, 101, 242, 0.3);
                        }
                        70% {
                            transform: translateY(0);
                        }
                    }
                    
                    .theme-toggle-bounce-discord {
                        animation: bounceDiscord 1.5s ease-in-out;
                    }
                `}</style>
                {/* Navbar starts after the server sidebar */}
                <nav className="fixed top-0 left-[72px] right-0 z-50 hidden md:flex h-12 items-center bg-[#202225] border-b border-[#1a1b1e]">
                    {/* Server Name Section - matches channel sidebar width */}
                    <div className="flex w-60 h-full items-center px-4 shrink-0 border-r border-[#1a1b1e] bg-[#2f3136]">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            {/* Server Badge/Icon */}
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-[#4752c4] flex items-center justify-center shrink-0">
                                <Logo className="w-5 h-5" forceWhite={true} />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="font-semibold text-white text-sm truncate">{BRANDING.name}</span>
                                <span className="text-[10px] text-gray-400 uppercase tracking-wide">Portfolio Server</span>
                            </div>
                        </div>
                    </div>

                    {/* Spacer + Controls */}
                    <div className="flex-1 flex items-center justify-end px-4 gap-3">
                        {/* Theme Switcher */}
                        <div className="relative">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-[#36393f] hover:bg-[#404449] text-gray-200 rounded transition-all ${isAnimating ? 'theme-toggle-bounce-discord' : ''}`}
                            >
                                <Gamepad2 className="w-3.5 h-3.5" />
                                <span>{THEME_LABELS.discord}</span>
                            </button>

                            {isDropdownOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setIsDropdownOpen(false)}
                                    />
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-[#18191c] shadow-xl rounded-md p-1.5 z-20 border border-[#1a1b1e]">
                                        <button
                                            onClick={() => { setTheme('minimalist'); setIsDropdownOpen(false); }}
                                            className="flex items-center w-full gap-2 px-3 py-2 text-sm hover:bg-[#36393f] rounded text-gray-200"
                                        >
                                            <Briefcase className="w-4 h-4" aria-hidden="true" /> {THEME_LABELS.minimalist}
                                        </button>
                                        <button
                                            onClick={() => { setTheme('neubrutalist'); setIsDropdownOpen(false); }}
                                            className="flex items-center w-full gap-2 px-3 py-2 text-sm hover:bg-[#36393f] rounded text-gray-200"
                                        >
                                            <Zap className="w-4 h-4" aria-hidden="true" /> {THEME_LABELS.neubrutalist}
                                        </button>
                                        <button
                                            onClick={() => { setTheme('discord'); setIsDropdownOpen(false); }}
                                            className="flex items-center w-full gap-2 px-3 py-2 text-sm hover:bg-[#36393f] rounded text-gray-200 bg-[#36393f] text-white"
                                        >
                                            <Gamepad2 className="w-4 h-4" aria-hidden="true" /> {THEME_LABELS.discord}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Window Controls (decorative) */}
                        <div className="flex items-center gap-2 ml-2">
                            <div className="w-3 h-3 rounded-full bg-[#3ba55c] opacity-60 hover:opacity-100 cursor-pointer transition-opacity" />
                            <div className="w-3 h-3 rounded-full bg-[#faa61a] opacity-60 hover:opacity-100 cursor-pointer transition-opacity" />
                            <div className="w-3 h-3 rounded-full bg-[#ed4245] opacity-60 hover:opacity-100 cursor-pointer transition-opacity" />
                        </div>
                    </div>
                </nav>

                {/* Mobile navbar - full width */}
                <nav className="fixed top-0 left-0 right-0 z-50 flex md:hidden h-16 items-center bg-[#202225] border-b border-[#1a1b1e] px-4" aria-label="Mobile navigation">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                            <Logo className="w-6 h-6" forceWhite={true} />
                        </div>
                        <span className="font-bold text-white text-base">{BRANDING.name}</span>
                    </div>

                    <div className="flex-1 flex justify-end gap-4">
                        <div className="relative">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                aria-expanded={isDropdownOpen}
                                aria-haspopup="true"
                                aria-label="Theme selector"
                                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium bg-[#36393f] hover:bg-[#404449] text-gray-200 rounded transition-all ${isAnimating ? 'theme-toggle-bounce-discord' : ''}`}
                            >
                                <Gamepad2 className="w-4 h-4" aria-hidden="true" />
                            </button>

                            {isDropdownOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setIsDropdownOpen(false)}
                                    />
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-[#18191c] shadow-xl rounded-md p-1.5 z-20 border border-[#1a1b1e]">
                                        <button
                                            onClick={() => { setTheme('minimalist'); setIsDropdownOpen(false); }}
                                            className="flex items-center w-full gap-2 px-3 py-2 text-sm hover:bg-[#36393f] rounded text-gray-200"
                                        >
                                            <Briefcase className="w-4 h-4" aria-hidden="true" /> {THEME_LABELS.minimalist}
                                        </button>
                                        <button
                                            onClick={() => { setTheme('neubrutalist'); setIsDropdownOpen(false); }}
                                            className="flex items-center w-full gap-2 px-3 py-2 text-sm hover:bg-[#36393f] rounded text-gray-200"
                                        >
                                            <Zap className="w-4 h-4" aria-hidden="true" /> {THEME_LABELS.neubrutalist}
                                        </button>
                                        <button
                                            onClick={() => { setTheme('discord'); setIsDropdownOpen(false); }}
                                            className="flex items-center w-full gap-2 px-3 py-2 text-sm hover:bg-[#36393f] rounded text-gray-200 bg-[#36393f] text-white"
                                        >
                                            <Gamepad2 className="w-4 h-4" aria-hidden="true" /> {THEME_LABELS.discord}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-expanded={isMobileMenuOpen}
                            aria-label="Toggle navigation menu"
                            className="p-2 hover:bg-[#404449] rounded transition-colors"
                        >
                            {isMobileMenuOpen ? (
                                <X className="w-5 h-5 text-gray-200" aria-hidden="true" />
                            ) : (
                                <Menu className="w-5 h-5 text-gray-200" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </nav>

                {/* Mobile Menu Panel */}
                {isMobileMenuOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-30 bg-black/60"
                            onClick={() => setIsMobileMenuOpen(false)}
                            aria-hidden="true"
                        />
                        <nav
                            aria-label="Mobile channel navigation"
                            className="fixed top-16 left-0 right-0 bottom-0 z-40 bg-[#2f3136] overflow-y-auto"
                        >
                            {/* Channels */}
                            <div className="p-3 pt-4">
                                {/* Portfolio Section */}
                                <div className="mb-4">
                                    <div className="flex items-center gap-1 px-2 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                        <ChevronDown className="w-3 h-3" />
                                        PORTFOLIO
                                    </div>
                                    {NAV_LINKS.filter(l => !l.isCTA).map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="flex items-center gap-2 px-3 py-2.5 rounded text-gray-300 hover:bg-[#42464d] hover:text-white"
                                        >
                                            <Hash className="w-5 h-5 opacity-70" />
                                            <span>{link.label}</span>
                                        </Link>
                                    ))}
                                </div>

                                {/* Contact Section */}
                                <div className="mb-4">
                                    <div className="flex items-center gap-1 px-2 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                        <ChevronDown className="w-3 h-3" />
                                        CONTACT
                                    </div>
                                    {NAV_LINKS.filter(l => l.isCTA).map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="flex items-center gap-2 px-3 py-2.5 rounded text-gray-300 hover:bg-[#42464d] hover:text-white"
                                        >
                                            <Mail className="w-5 h-5 opacity-70" />
                                            <span>{link.label}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* User Panel at Bottom */}
                            <div className="absolute bottom-0 left-0 right-0 h-14 bg-[#292b2f] px-4 flex items-center gap-3 border-t border-[#202225]">
                                <div className="relative">
                                    <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-white font-bold">
                                        A
                                    </div>
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#3ba55c] rounded-full border-[3px] border-[#292b2f]" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-white">{BRANDING.name}</div>
                                    <div className="text-xs text-gray-400">Online</div>
                                </div>
                            </div>
                        </nav>
                    </>
                )}
            </>
        );
    }

    // Default navbar for Minimalist and Neubrutalist themes
    return (
        <>
            <style jsx global>{`
                @keyframes pulseMinimalist {
                    0%, 100% { 
                        box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
                        transform: scale(1);
                        background-color: inherit;
                    }
                    15%, 45% { 
                        box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.15);
                        transform: scale(1.08);
                    }
                    30% { 
                        box-shadow: 0 0 0 6px rgba(0, 0, 0, 0.1);
                        transform: scale(1.05);
                    }
                    60% {
                        box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.08);
                        transform: scale(1.03);
                    }
                }
                
                @keyframes wiggleNeubrutalist {
                    0%, 100% { transform: rotate(0deg); }
                    10% { transform: rotate(-3deg) scale(1.05); }
                    20% { transform: rotate(3deg) scale(1.05); }
                    30% { transform: rotate(-3deg) scale(1.05); }
                    40% { transform: rotate(3deg) scale(1.05); }
                    50% { transform: rotate(-2deg); }
                    60% { transform: rotate(2deg); }
                    70% { transform: rotate(-1deg); }
                    80% { transform: rotate(1deg); }
                    90% { transform: rotate(0deg); }
                }
                
                .theme-toggle-pulse-minimalist {
                    animation: pulseMinimalist 1.5s ease-in-out;
                }
                
                .theme-toggle-wiggle {
                    animation: wiggleNeubrutalist 1.5s ease-in-out;
                }
            `}</style>
            <nav className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-theme bg-background px-6 transition-colors duration-300">
                <div className="flex items-center gap-2">
                    <Logo className="w-8 h-8 md:w-10 md:h-10" />
                    <div className={`text-xl font-bold tracking-tight hidden md:block ${theme === 'minimalist' ? 'font-serif' : 'font-theme'}`}>
                        {BRANDING.name}
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-10 font-theme text-sm font-medium text-foreground opacity-80">
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`
                                hover:text-accent transition-colors
                                ${link.isCTA && theme === 'minimalist' ? 'inline-flex items-center gap-1 border border-ink px-3 py-1.5 hover:bg-ink hover:text-paper' : ''}
                                ${link.isCTA && theme === 'neubrutalist' ? 'px-4 py-2 bg-accent text-black border-2 border-black shadow-[2px_2px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000]' : ''}
                            `}
                        >
                            {link.label}{link.isCTA && theme === 'minimalist' && " →"}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            aria-expanded={isDropdownOpen}
                            aria-haspopup="true"
                            aria-label={`Skin selector, current skin: ${THEME_LABELS[theme]}`}
                            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border border-theme rounded-theme hover:bg-accent-secondary transition-all ${getAnimationClass()}`}
                        >
                            <span>{THEME_LABELS[theme]}</span>
                        </button>

                        {isDropdownOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setIsDropdownOpen(false)}
                                    aria-hidden="true"
                                />
                                <div className="absolute right-0 top-full mt-2 w-48 border border-theme bg-background shadow-theme rounded-theme p-2 z-20 transition-all">
                                    <button
                                        onClick={() => { setTheme('minimalist'); setIsDropdownOpen(false); }}
                                        className={`flex items-center w-full gap-2 px-3 py-2 text-sm hover:bg-accent-secondary rounded-theme ${theme === 'minimalist' ? 'bg-accent-secondary font-bold' : ''}`}
                                    >
                                        <Briefcase className="w-4 h-4" aria-hidden="true" /> {THEME_LABELS.minimalist}
                                    </button>
                                    <button
                                        onClick={() => { setTheme('neubrutalist'); setIsDropdownOpen(false); }}
                                        className={`flex items-center w-full gap-2 px-3 py-2 text-sm hover:bg-accent-secondary rounded-theme ${theme === 'neubrutalist' ? 'bg-accent-secondary font-bold' : ''}`}
                                    >
                                        <Zap className="w-4 h-4" aria-hidden="true" /> {THEME_LABELS.neubrutalist}
                                    </button>
                                    <button
                                        onClick={() => { setTheme('discord'); setIsDropdownOpen(false); }}
                                        className="flex items-center w-full gap-2 px-3 py-2 text-sm hover:bg-accent-secondary rounded-theme"
                                    >
                                        <Gamepad2 className="w-4 h-4" aria-hidden="true" /> {THEME_LABELS.discord}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-expanded={isMobileMenuOpen}
                        aria-label="Toggle mobile menu"
                        className={`
                            md:hidden p-2 rounded-theme
                            ${theme === 'minimalist' ? 'hover:bg-accent-secondary' : ''}
                            ${theme === 'neubrutalist' ? 'border-2 border-black hover:bg-accent' : ''}
                        `}
                    >
                        {isMobileMenuOpen ? (
                            <X className="w-6 h-6" aria-hidden="true" />
                        ) : (
                            <Menu className="w-6 h-6" aria-hidden="true" />
                        )}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-black/50 md:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                        aria-hidden="true"
                    />
                    <nav
                        aria-label="Mobile navigation"
                        className={`
                            fixed top-16 left-0 right-0 z-50 md:hidden
                            border-b border-theme
                            ${theme === 'minimalist' ? 'bg-background' : ''}
                            ${theme === 'neubrutalist' ? 'bg-[#FFFDF5] border-b-[3px] border-black' : ''}
                        `}
                    >
                        <div className="flex flex-col p-4 gap-2">
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`
                                        px-4 py-3 font-medium rounded-theme transition-colors
                                        ${theme === 'minimalist' ? 'hover:bg-accent-secondary' : ''}
                                        ${theme === 'neubrutalist' ? 'hover:bg-accent border-2 border-black' : ''}
                                        ${link.isCTA && theme === 'minimalist' ? 'bg-foreground text-background font-bold mt-2' : ''}
                                        ${link.isCTA && theme === 'neubrutalist' ? 'bg-accent text-black border-[3px] border-black shadow-[2px_2px_0px_#000] font-bold mt-2' : ''}
                                    `}
                                >
                                    {link.label}{link.isCTA && theme === 'minimalist' && " →"}
                                </Link>
                            ))}
                        </div>
                    </nav>
                </>
            )}
        </>
    );
}
