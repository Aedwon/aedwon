"use client";

import { useTheme } from "./ThemeContext";
import { motion } from "framer-motion";

// Consistent color scheme across all sentiment indicators:
// Positive: #57F287 (Discord) / green-600 (Neubrutalist) / green-400 (Minimalist)
// Neutral: #6b7280 (Discord) / gray-400 (Neubrutalist) / gray-300 (Minimalist)
// Negative: #ED4245 (Discord) / red-500 (Neubrutalist) / red-400 (Minimalist)

const DATA = [
    { label: "Mon", pos: 65, neu: 25, neg: 10 },
    { label: "Tue", pos: 45, neu: 25, neg: 30 },
    { label: "Wed", pos: 75, neu: 20, neg: 5 },
    { label: "Thu", pos: 55, neu: 30, neg: 15 },
    { label: "Fri", pos: 85, neu: 7, neg: 8 },
    { label: "Sat", pos: 90, neu: 8, neg: 2 },
    { label: "Sun", pos: 70, neu: 18, neg: 12 },
];

export default function SentimentChart() {
    const { theme } = useTheme();

    return (
        <div className={`
      w-full p-4 flex flex-col gap-4 h-full
      ${theme === 'minimalist' ? 'bg-background border border-theme' : ''}
      ${theme === 'neubrutalist' ? 'bg-white border-[3px] border-black shadow-[4px_4px_0px_#000]' : ''}
      ${theme === 'discord' ? 'bg-accent-secondary rounded-theme' : ''}
    `}>
            <h3 className="text-xl font-bold font-theme tracking-tight flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                <span>Sentiment Analysis</span>
                <span className={`text-xs px-2 py-1 ${theme === 'neubrutalist' ? 'bg-black text-white' : 'bg-accent-secondary opacity-70'} rounded-sm self-start sm:self-auto`}>Last 7 Days</span>
            </h3>

            <div className="flex-grow flex items-end justify-between gap-2 mt-4 min-h-0 overflow-hidden">
                {DATA.map((d, i) => (
                    <div key={i} className="flex flex-col items-center gap-1 w-full h-full justify-end group">
                        <div className="w-full flex gap-0.5 items-end justify-center flex-grow relative">
                            {/* Positive Bar */}
                            <motion.div
                                initial={{ height: 0 }}
                                whileInView={{ height: `${d.pos}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className={`
                    w-2 md:w-3 min-h-[4px]
                    ${theme === 'minimalist' ? 'bg-green-400' : ''}
                    ${theme === 'neubrutalist' ? 'bg-green-600 border border-black' : ''}
                    ${theme === 'discord' ? 'bg-[#57F287]' : ''}
                 `}
                            />
                            {/* Neutral Bar */}
                            <motion.div
                                initial={{ height: 0 }}
                                whileInView={{ height: `${d.neu}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 + 0.03 }}
                                className={`
                    w-2 md:w-3 min-h-[4px]
                    ${theme === 'minimalist' ? 'bg-gray-300' : ''}
                    ${theme === 'neubrutalist' ? 'bg-gray-400 border border-black' : ''}
                    ${theme === 'discord' ? 'bg-[#6b7280]' : ''}
                 `}
                            />
                            {/* Negative Bar */}
                            <motion.div
                                initial={{ height: 0 }}
                                whileInView={{ height: `${d.neg}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 + 0.06 }}
                                className={`
                    w-2 md:w-3 min-h-[4px]
                    ${theme === 'minimalist' ? 'bg-red-400' : ''}
                    ${theme === 'neubrutalist' ? 'bg-red-500 border border-black' : ''}
                    ${theme === 'discord' ? 'bg-[#ED4245]' : ''}
                 `}
                            />
                        </div>
                        <span className="text-[10px] opacity-60 font-mono uppercase shrink-0">{d.label}</span>
                    </div>
                ))}
            </div>

            <div className="flex gap-4 text-xs font-bold mt-2">
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 ${theme === 'minimalist' ? 'bg-green-400' : theme === 'neubrutalist' ? 'bg-green-600 border border-black' : 'bg-[#57F287]'}`}></div>
                    <span>Positive</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 ${theme === 'minimalist' ? 'bg-gray-300' : theme === 'neubrutalist' ? 'bg-gray-400 border border-black' : 'bg-[#6b7280]'}`}></div>
                    <span>Neutral</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 ${theme === 'minimalist' ? 'bg-red-400' : theme === 'neubrutalist' ? 'bg-red-500 border border-black' : 'bg-[#ED4245]'}`}></div>
                    <span>Negative</span>
                </div>
            </div>
        </div>
    );
}
