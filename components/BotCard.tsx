"use client";

import { useTheme } from "./ThemeContext";
import { Bot, ShieldCheck } from "lucide-react";

export default function BotCard() {
    const { theme } = useTheme();

    return (
        <div className={`
      w-full p-6 flex flex-col gap-4
      ${theme === 'minimalist' ? 'bg-background border border-theme' : ''}
      ${theme === 'neubrutalist' ? 'bg-[#61afef] border-[3px] border-black shadow-[4px_4px_0px_#000] text-black' : ''}
      ${theme === 'discord' ? 'bg-accent-secondary rounded-theme' : ''}
    `}>
            {/* Header / Banner area simulation */}
            <div className={`
        flex items-start justify-between
        ${theme === 'discord' ? 'border-b border-[#202225] pb-4 mb-2' : ''}
      `}>
                <div className="flex items-center gap-4">
                    <div className={`
                relative w-16 h-16 flex items-center justify-center
                ${theme === 'minimalist' ? 'bg-accent-secondary rounded-full' : ''}
                ${theme === 'neubrutalist' ? 'bg-white border-2 border-black' : ''}
                ${theme === 'discord' ? 'bg-accent rounded-full' : ''}
            `}>
                        <Bot className="w-10 h-10" />
                        {/* Status Indicator */}
                        <div className={`
                    absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-background
                    ${theme === 'neubrutalist' ? 'border-black' : ''}
                    bg-green-500
                `} title="Online"></div>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold font-theme flex items-center gap-2">
                            AutoMod Pro
                            {theme === 'discord' && <span className="bg-accent text-white text-[10px] uppercase px-1.5 rounded-[3px] py-[1px]">Bot</span>}
                        </h3>
                        <p className={`text-sm ${theme === 'neubrutalist' ? 'text-black font-bold' : 'opacity-70'}`}>#1337</p>
                    </div>
                </div>

                <ShieldCheck className={`w-6 h-6 ${theme === 'neubrutalist' ? 'text-black' : 'text-green-500'}`} />
            </div>

            <div className={`
         p-4 text-sm mt-2
         ${theme === 'minimalist' ? 'bg-accent-secondary/30' : ''}
         ${theme === 'neubrutalist' ? 'bg-white border-2 border-black' : ''}
         ${theme === 'discord' ? 'bg-[#202225] rounded-md text-gray-300' : ''}
      `}>
                <p><strong>About Me:</strong></p>
                <p className="mt-1 opacity-90">
                    I automatically detect spam, manage ticket systems, and track user engagement levels.
                    Currently protecting <span className="font-bold">14,000+</span> members.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
                <div className={`text-center p-2 ${theme === 'neubrutalist' ? 'bg-black text-white' : 'bg-accent-secondary rounded-sm'}`}>
                    <div className="text-xs uppercase opacity-70">Uptime</div>
                    <div className="font-bold">99.9%</div>
                </div>
                <div className={`text-center p-2 ${theme === 'neubrutalist' ? 'bg-black text-white' : 'bg-accent-secondary rounded-sm'}`}>
                    <div className="text-xs uppercase opacity-70">Actions</div>
                    <div className="font-bold">1.2M</div>
                </div>
            </div>
        </div>
    );
}
