"use client";

import { motion } from "framer-motion";
import { ArrowRight, Bot, Sparkles, Pin } from "lucide-react";
import Link from "next/link";
import { HERO, STATS, BRANDING } from "@/lib/portfolio";

// Discord Message Component
function DiscordMessage({
    author,
    avatar,
    timestamp,
    isPinned = false,
    children
}: {
    author: string;
    avatar: string;
    timestamp: string;
    isPinned?: boolean;
    children: React.ReactNode
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="discord-message group flex gap-4 py-2 hover:bg-[#32353b]"
        >
            <div className="shrink-0">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-bold">
                    {avatar}
                </div>
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-white hover:underline cursor-pointer">{author}</span>
                    {isPinned && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Pin className="w-3 h-3" /> Pinned
                        </span>
                    )}
                    <span className="text-xs text-gray-500">{timestamp}</span>
                </div>
                {children}
            </div>
        </motion.div>
    );
}

// Discord Embed Component
function DiscordEmbed({
    color = "#5865F2",
    title,
    description,
    fields,
    footer
}: {
    color?: string;
    title?: string;
    description?: string;
    fields?: { name: string; value: string; inline?: boolean }[];
    footer?: string;
}) {
    return (
        <div
            className="max-w-lg mt-2 rounded overflow-hidden"
            style={{ borderLeft: `4px solid ${color}` }}
        >
            <div className="bg-[#2f3136] p-4">
                {title && (
                    <div className="font-semibold text-white mb-2">{title}</div>
                )}
                {description && (
                    <div className="text-sm text-gray-300 mb-3">{description}</div>
                )}
                {fields && (
                    <div className="grid grid-cols-2 gap-2">
                        {fields.map((field, i) => (
                            <div key={i} className={field.inline ? '' : 'col-span-2'}>
                                <div className="text-xs font-semibold text-gray-400 uppercase">{field.name}</div>
                                <div className="text-sm text-gray-300">{field.value}</div>
                            </div>
                        ))}
                    </div>
                )}
                {footer && (
                    <div className="text-xs text-gray-500 mt-3 pt-2 border-t border-[#42464d]">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}

// Discord Button
function DiscordButton({
    children,
    primary = false,
    href
}: {
    children: React.ReactNode;
    primary?: boolean;
    href: string;
}) {
    return (
        <Link href={href}>
            <button className={`
                inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded transition-colors
                ${primary
                    ? 'bg-accent text-white hover:bg-[#4752c4]'
                    : 'bg-[#4f545c] text-white hover:bg-[#686d73]'
                }
            `}>
                {children}
            </button>
        </Link>
    );
}

export default function DiscordHeroSection() {
    return (
        <div className="flex flex-col min-h-[calc(100vh-var(--nav-height)-48px)] bg-[#36393f]">
            {/* Welcome Banner */}
            <div className="bg-[#2f3136] border-b border-[#202225] p-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                        <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">Welcome to #home</h1>
                        <p className="text-sm text-gray-400">This is the start of your journey with {BRANDING.name}</p>
                    </div>
                </div>
            </div>

            <div className="discord-divider mx-4 flex items-center gap-2">
                <span className="text-xs text-gray-500 bg-[#36393f] px-2">Today</span>
            </div>

            {/* Messages */}
            <div className="flex-1 px-4 py-2 space-y-4">
                {/* Pinned Welcome Message */}
                <DiscordMessage author={BRANDING.name} avatar={BRANDING.name[0]} timestamp="Today at 12:00 PM" isPinned>
                    <p className="text-gray-300">
                        Hey! <span className="discord-mention">@everyone</span> 👋
                    </p>
                    <p className="text-gray-300 mt-2">
                        A brand sells twice: once to the stranger, once to the regular.
                        <span className="font-semibold text-white"> I build for both sales.</span>
                    </p>
                    <DiscordEmbed
                        color="#5865F2"
                        title="What I do"
                        description={HERO.subtitle}
                        fields={[
                            { name: "Stack", value: "Next.js • React • TypeScript • Node.js • Discord.py", inline: false },
                            { name: "Bots in production", value: String(STATS.BOT_COUNT), inline: true },
                            { name: "Members moderated", value: STATS.MODERATED_MEMBERS, inline: true },
                        ]}
                        footer="Pick a channel on the left to see the work →"
                    />
                </DiscordMessage>

                {/* Web Services Message */}
                <DiscordMessage author={BRANDING.name} avatar={BRANDING.name[0]} timestamp="Today at 12:01 PM">
                    <p className="text-gray-300">
                        <span className="discord-ping">💻 THE STRANGER SALE</span>
                    </p>
                    <DiscordEmbed
                        color="#3ba55c"
                        title={HERO.webPanel.label}
                        description={HERO.webPanel.headline}
                        fields={[
                            { name: "✨ Standards", value: HERO.webPanel.bullets[0], inline: true },
                            { name: "🎯 Accessibility", value: HERO.webPanel.bullets[1], inline: true },
                        ]}
                    />
                    <div className="flex gap-2 mt-3">
                        <DiscordButton primary href="/web-solutions">
                            <Sparkles className="w-4 h-4" /> {HERO.webPanel.cta}
                        </DiscordButton>
                    </div>
                </DiscordMessage>

                {/* Community Services Message */}
                <DiscordMessage author={BRANDING.name} avatar={BRANDING.name[0]} timestamp="Today at 12:02 PM">
                    <p className="text-gray-300">
                        <span className="discord-ping">🤖 THE REGULAR SALE</span>
                    </p>
                    <DiscordEmbed
                        color="#faa61a"
                        title={HERO.communityPanel.label}
                        description={HERO.communityPanel.headline}
                        fields={[
                            { name: "🛡️ In production", value: HERO.communityPanel.bullets[0], inline: true },
                            { name: "👥 Moderated", value: HERO.communityPanel.bullets[1], inline: true },
                        ]}
                    />
                    <div className="flex gap-2 mt-3">
                        <DiscordButton href="/community-solutions">
                            {HERO.communityPanel.cta}
                        </DiscordButton>
                    </div>
                </DiscordMessage>

                {/* Reactions */}
                <div className="flex gap-1 pl-14">
                    <button className="flex items-center gap-1 px-2 py-0.5 bg-[#2f3136] hover:bg-[#36393f] border border-[#42464d] rounded text-sm">
                        <span>🔥</span> <span className="text-gray-400">12</span>
                    </button>
                    <button className="flex items-center gap-1 px-2 py-0.5 bg-[#2f3136] hover:bg-[#36393f] border border-[#42464d] rounded text-sm">
                        <span>👀</span> <span className="text-gray-400">8</span>
                    </button>
                    <button className="flex items-center gap-1 px-2 py-0.5 bg-[#2f3136] hover:bg-[#36393f] border border-[#42464d] rounded text-sm">
                        <span>💯</span> <span className="text-gray-400">5</span>
                    </button>
                </div>
            </div>

            {/* Message Input */}
            <div className="p-4">
                <div className="bg-[#40444b] rounded-lg p-3 flex items-center gap-3">
                    <button className="text-gray-400 hover:text-gray-200">
                        <span className="text-xl">+</span>
                    </button>
                    <input
                        type="text"
                        placeholder="Message #home"
                        className="flex-1 bg-transparent text-gray-200 placeholder-gray-500 outline-none"
                        disabled
                    />
                    <div className="flex items-center gap-2 text-gray-400">
                        <span className="hover:text-gray-200 cursor-pointer">🎁</span>
                        <span className="hover:text-gray-200 cursor-pointer">GIF</span>
                        <span className="hover:text-gray-200 cursor-pointer">😀</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
