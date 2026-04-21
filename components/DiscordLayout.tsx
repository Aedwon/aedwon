"use client";

import { useTheme } from "./ThemeContext";
import { Home, Code, Users, FileText, Mail, Hash, Volume2, ChevronDown, Settings, Mic, Headphones } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import { BRANDING, NAV_LINKS } from "@/lib/portfolio";

const SERVERS = [
    { id: 'home', icon: Home, href: '/', label: 'Home' },
];

const CHANNELS = [
    {
        category: 'PORTFOLIO',
        items: NAV_LINKS.filter(l => !l.isCTA).map(l => ({
            id: l.href === '/' ? 'home' : l.href.slice(1),
            icon: Hash,
            href: l.href,
            label: l.label
        }))
    },
    {
        category: 'CONTACT',
        items: NAV_LINKS.filter(l => l.isCTA).map(l => ({
            id: l.href.slice(1),
            icon: Mail,
            href: l.href,
            label: l.label
        }))
    },
];

export default function DiscordLayout({ children }: { children: React.ReactNode }) {
    const { theme } = useTheme();
    const pathname = usePathname();

    // Only render Discord layout when theme is discord
    if (theme !== 'discord') {
        return <>{children}</>;
    }

    return (
        <>
            {/* Server Sidebar - Fixed full height, starts from top */}
            <div className="hidden md:flex fixed top-0 left-0 w-[72px] h-screen bg-[#202225] flex-col items-center py-3 gap-2 z-40">
                {/* Home Server */}
                <Link href="/">
                    <div className={`
                        w-12 h-12 rounded-[24px] hover:rounded-[16px] transition-all duration-200 
                        flex items-center justify-center cursor-pointer
                        ${pathname === '/'
                            ? 'bg-accent rounded-[16px]'
                            : 'bg-[#36393f] hover:bg-accent'
                        }
                    `}>
                        <Logo className="w-7 h-7" forceWhite />
                    </div>
                </Link>

                {/* Divider */}
                <div className="w-8 h-0.5 bg-[#36393f] rounded-full my-1" />

                {/* Portfolio Server */}
                <div className={`
                    w-12 h-12 rounded-[24px] hover:rounded-[16px] transition-all duration-200 
                    flex items-center justify-center cursor-pointer
                    bg-[#5865F2] rounded-[16px]
                `}>
                    <span className="text-white font-bold text-lg">{BRANDING.name[0]}</span>
                </div>

                {/* Add Server */}
                <div className="w-12 h-12 rounded-[24px] hover:rounded-[16px] transition-all duration-200 flex items-center justify-center cursor-pointer bg-[#36393f] hover:bg-[#3ba55c] group">
                    <span className="text-[#3ba55c] group-hover:text-white text-2xl font-light">+</span>
                </div>
            </div>

            {/* Main layout area - offset by server sidebar on desktop only */}
            <div className="flex fixed top-16 md:top-12 left-0 md:left-[72px] right-0 bottom-0 overflow-hidden bg-[#36393f]">
                {/* Channel Sidebar */}
                <div className="hidden md:flex w-60 bg-[#2f3136] flex-col shrink-0">
                    {/* Channels - starts below the navbar area */}
                    <div className="flex-1 overflow-y-auto pt-4 px-2">
                        {CHANNELS.map((section) => (
                            <div key={section.category} className="mb-4">
                                <div className="flex items-center gap-1 px-1 mb-1 text-xs font-semibold text-gray-400 uppercase tracking-wide cursor-pointer hover:text-gray-300">
                                    <ChevronDown className="w-3 h-3" />
                                    {section.category}
                                </div>
                                {section.items.map((channel) => (
                                    <Link key={channel.id} href={channel.href}>
                                        <div className={`
                                            flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-sm
                                            ${pathname === channel.href
                                                ? 'bg-[#42464d] text-white'
                                                : 'text-gray-400 hover:text-gray-200 hover:bg-[#36393f]'
                                            }
                                        `}>
                                            <channel.icon className="w-5 h-5 opacity-70" />
                                            <span className="truncate">{channel.label}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* User Panel */}
                    <div className="h-[52px] bg-[#292b2f] px-2 flex items-center gap-2">
                        <div className="relative">
                            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white font-bold text-sm">
                                A
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#3ba55c] rounded-full border-[3px] border-[#292b2f]" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-white truncate">{BRANDING.name}</div>
                            <div className="text-xs text-gray-400 truncate">Online</div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button className="p-1.5 hover:bg-[#36393f] rounded">
                                <Mic className="w-4 h-4 text-gray-400" />
                            </button>
                            <button className="p-1.5 hover:bg-[#36393f] rounded">
                                <Headphones className="w-4 h-4 text-gray-400" />
                            </button>
                            <button className="p-1.5 hover:bg-[#36393f] rounded">
                                <Settings className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col overflow-hidden bg-[#36393f]">
                    {/* Channel Header */}
                    <div className="h-12 px-4 flex items-center gap-2 border-b border-[#202225] shadow-sm shrink-0 min-w-0">
                        <Hash className="w-6 h-6 text-gray-400 shrink-0" />
                        <span className="font-bold text-white whitespace-nowrap">
                            {pathname === '/' ? 'home' : pathname.slice(1).replace('/', '-')}
                        </span>
                        <div className="w-px h-6 bg-[#42464d] mx-2 shrink-0" />
                        <span className="text-sm text-gray-400 truncate flex-1 min-w-0">
                            Welcome to my portfolio! Explore my work and get in touch.
                        </span>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto">
                        {children}
                    </div>
                </div>
            </div>
        </>
    );
}
