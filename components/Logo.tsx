"use client";

import { useTheme } from "./ThemeContext";

interface LogoProps {
    className?: string;
    forceWhite?: boolean;
}

export default function Logo({ className = "w-10 h-10", forceWhite = false }: LogoProps) {
    const { theme } = useTheme();

    return (
        <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`${className} transition-colors duration-300 transform hover:scale-105`}
        >
            <path
                d="M50 15 L15 85 H32 L50 45 L68 85 H85 L50 15 Z"
                className={`
                    fill-current
                    ${forceWhite ? 'text-white' : ''}
                    ${!forceWhite && theme === 'minimalist' ? 'text-foreground' : ''}
                    ${!forceWhite && theme === 'neubrutalist' ? 'text-black' : ''}
                    ${!forceWhite && theme === 'discord' ? 'text-accent' : ''}
                `}
            />
            {/* Floating Chevron / Crossbar Effect */}
            <path
                d="M50 55 L38 75 H62 L50 55 Z"
                className={`
                    ${forceWhite ? 'fill-transparent' : ''}
                    ${!forceWhite && theme === 'minimalist' ? 'fill-background' : ''}
                    ${!forceWhite && theme === 'neubrutalist' ? 'fill-white' : ''}
                    ${!forceWhite && theme === 'discord' ? 'fill-[#2f3136]' : ''}
                `}
            />
        </svg>
    );
}

