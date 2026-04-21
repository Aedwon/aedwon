"use client";

import { useTheme } from "@/components/ThemeContext";
import SentimentChart from "@/components/SentimentChart";
import BotCard from "@/components/BotCard";
import { motion } from "framer-motion";
import { TrendingUp, ShieldAlert } from "lucide-react";

export default function DashboardPreview() {
    const { theme } = useTheme();

    return (
        <>
            {/* Key Metrics Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: "Active Members", value: "12.5k", change: "+18%", positive: true },
                    { label: "Messages/Day", value: "3,240", change: "-25%", positive: false },
                    { label: "Avg. Response", value: "4.2min", change: "-32%", positive: true },
                    { label: "Churn Rate", value: "2.1%", change: "-15%", positive: true },
                ].map((metric, i) => (
                    <motion.div
                        key={metric.label}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                        className={`
                            p-4 text-center
                            ${theme === 'minimalist' ? 'border border-theme' : ''}
                            ${theme === 'neubrutalist' ? 'bg-white border-[3px] border-black shadow-[4px_4px_0px_#000]' : ''}
                            ${theme === 'discord' ? 'bg-[#36393f] rounded-lg' : ''}
                        `}
                    >
                        <p className="text-xs uppercase opacity-60 mb-1">{metric.label}</p>
                        <p className="text-2xl font-bold font-theme">{metric.value}</p>
                        <p className={`text-xs font-medium ${theme === 'discord'
                            ? (metric.positive ? 'text-[#57F287]' : 'text-[#ED4245]')
                            : (metric.positive ? 'text-green-700' : 'text-red-600')
                            }`}>
                            {metric.change} this month
                        </p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Column 1: Bot Status + Moderation Stats + Engagement Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col gap-4"
                >
                    <h3 className="text-lg font-bold font-theme flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-accent" />
                        Moderation Bot
                    </h3>
                    <BotCard />

                    {/* Unified Stats Card - Moderation + Engagement */}
                    <div className={`
                        p-3
                        ${theme === 'minimalist' ? 'border border-theme' : ''}
                        ${theme === 'neubrutalist' ? 'bg-white border-[3px] border-black shadow-[4px_4px_0px_#000]' : ''}
                        ${theme === 'discord' ? 'bg-[#36393f] rounded-lg' : ''}
                    `}>
                        <p className="text-xs uppercase opacity-60 font-bold mb-2">This Week</p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-4">
                            {[
                                { label: "Spam Blocked", value: "847", icon: "🛡️" },
                                { label: "Scam Links", value: "124", icon: "🔗" },
                                { label: "Warnings Issued", value: "23", icon: "⚠️" },
                                { label: "Timeouts", value: "8", icon: "⏱️" },
                            ].map((stat) => (
                                <div key={stat.label} className="flex items-center justify-between text-xs">
                                    <span className="opacity-70">{stat.icon} {stat.label}</span>
                                    <span className="font-bold">{stat.value}</span>
                                </div>
                            ))}
                        </div>

                        <div className={`border-t mb-3 ${theme === 'discord' ? 'border-[#202225]' : 'border-theme'}`}></div>

                        <div>
                            <p className="text-xs uppercase opacity-60 font-bold mb-2">Engagement</p>
                            <div className="grid grid-cols-3 gap-2 text-center">
                                {[
                                    { label: "Peak", value: "8-11 PM" },
                                    { label: "Top", value: "#general" },
                                    { label: "Avg.", value: "24 min" },
                                ].map((stat) => (
                                    <div key={stat.label}>
                                        <p className="text-[10px] uppercase opacity-50">{stat.label}</p>
                                        <p className="text-sm font-bold text-accent truncate">{stat.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Column 2: Sentiment Chart + Trending Topics */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col gap-4 lg:col-span-2"
                >
                    <h3 className="text-lg font-bold font-theme flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-accent" />
                        Community Sentiment Over Time
                    </h3>
                    <div className="h-64 lg:h-72 w-full">
                        <SentimentChart />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Sentiment Breakdown */}
                        <div className={`
                            p-4 flex flex-col
                            ${theme === 'minimalist' ? 'border border-theme' : ''}
                            ${theme === 'neubrutalist' ? 'bg-white border-[3px] border-black shadow-[4px_4px_0px_#000]' : ''}
                            ${theme === 'discord' ? 'bg-[#36393f] rounded-lg' : ''}
                        `}>
                            <p className="text-xs uppercase opacity-60 font-bold mb-3">Sentiment Breakdown</p>
                            <div className="flex items-center justify-center gap-6 flex-grow">
                                <div
                                    className="w-24 h-24 rounded-full flex-shrink-0"
                                    style={{
                                        background: `conic-gradient(
                                            ${theme === 'discord' ? '#57F287' : theme === 'neubrutalist' ? '#16a34a' : '#4ade80'} 0% 68%,
                                            ${theme === 'discord' ? '#6b7280' : theme === 'neubrutalist' ? '#9ca3af' : '#d1d5db'} 68% 92%,
                                            ${theme === 'discord' ? '#ED4245' : theme === 'neubrutalist' ? '#ef4444' : '#f87171'} 92% 100%
                                        )`
                                    }}
                                />
                                <div className="space-y-1 text-xs">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-3 h-3 rounded-full ${theme === 'discord' ? 'bg-[#57F287]' : theme === 'neubrutalist' ? 'bg-green-600' : 'bg-green-400'}`}></span>
                                        <span className="opacity-70">Positive</span>
                                        <span className="font-bold">68%</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`w-3 h-3 rounded-full ${theme === 'discord' ? 'bg-[#6b7280]' : theme === 'neubrutalist' ? 'bg-gray-400' : 'bg-gray-300'}`}></span>
                                        <span className="opacity-70">Neutral</span>
                                        <span className="font-bold">24%</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`w-3 h-3 rounded-full ${theme === 'discord' ? 'bg-[#ED4245]' : theme === 'neubrutalist' ? 'bg-red-500' : 'bg-red-400'}`}></span>
                                        <span className="opacity-70">Negative</span>
                                        <span className="font-bold">8%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Trending Topics */}
                        <div className={`
                            p-3
                            ${theme === 'minimalist' ? 'border border-theme' : ''}
                            ${theme === 'neubrutalist' ? 'bg-white border-[3px] border-black shadow-[4px_4px_0px_#000]' : ''}
                            ${theme === 'discord' ? 'bg-[#36393f] rounded-lg' : ''}
                        `}>
                            <p className="text-xs uppercase opacity-60 font-bold mb-3">Trending Topics</p>

                            <div className="mb-2">
                                <p className={`text-xs font-semibold mb-1 ${theme === 'discord' ? 'text-[#57F287]' : theme === 'neubrutalist' ? 'text-green-600' : 'text-green-500'}`}>
                                    ↑ Top Positive
                                </p>
                                <div className="flex flex-wrap gap-1">
                                    {[
                                        { topic: "Season 2 hype", count: 342 },
                                        { topic: "Amazing support", count: 156 },
                                    ].map((item) => (
                                        <span
                                            key={item.topic}
                                            className={`
                                                inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full
                                                ${theme === 'discord' ? 'bg-[#57F287]/20 text-[#57F287]' : theme === 'neubrutalist' ? 'bg-green-100 text-green-600' : 'bg-green-50 text-green-500'}
                                            `}
                                        >
                                            {item.topic}
                                            <span className="opacity-60">({item.count})</span>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-2">
                                <p className={`text-xs font-semibold mb-1 ${theme === 'discord' ? 'text-[#ED4245]' : theme === 'neubrutalist' ? 'text-red-500' : 'text-red-400'}`}>
                                    ↓ Top Negative
                                </p>
                                <div className="flex flex-wrap gap-1">
                                    {[
                                        { topic: "Server lag issues", count: 89 },
                                        { topic: "Update delays", count: 67 },
                                    ].map((item) => (
                                        <span
                                            key={item.topic}
                                            className={`
                                                inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full
                                                ${theme === 'discord' ? 'bg-[#ED4245]/20 text-[#ED4245]' : theme === 'neubrutalist' ? 'bg-red-100 text-red-500' : 'bg-red-50 text-red-400'}
                                            `}
                                        >
                                            {item.topic}
                                            <span className="opacity-60">({item.count})</span>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <p className={`text-xs font-semibold mb-1 ${theme === 'discord' ? 'text-[#6b7280]' : theme === 'neubrutalist' ? 'text-gray-500' : 'text-gray-400'}`}>
                                    ● Top Neutral
                                </p>
                                <div className="flex flex-wrap gap-1">
                                    {[
                                        { topic: "Game night ideas", count: 218 },
                                        { topic: "Collabs", count: 112 },
                                    ].map((item) => (
                                        <span
                                            key={item.topic}
                                            className={`
                                                inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full
                                                ${theme === 'discord' ? 'bg-[#6b7280]/20 text-[#6b7280]' : theme === 'neubrutalist' ? 'bg-gray-100 text-gray-500' : 'bg-gray-50 text-gray-400'}
                                            `}
                                        >
                                            {item.topic}
                                            <span className="opacity-60">({item.count})</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </>
    );
}
