import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                accent: "var(--accent)",
                "accent-secondary": "var(--accent-secondary)",
                border: "var(--border-color)",
                ink: "var(--color-ink)",
                paper: "var(--color-paper)",
                rule: "var(--color-rule)",
            },
            borderRadius: {
                theme: "var(--radius)",
            },
            borderWidth: {
                theme: "var(--border-width)",
            },
            boxShadow: {
                theme: "var(--shadow)",
            },
            fontFamily: {
                theme: "var(--font-main)",
                sans: "var(--font-sans)",
                serif: "var(--font-serif)",
                mono: "var(--font-mono)",
            },
            fontSize: {
                micro: "var(--fs-micro)",
                small: "var(--fs-small)",
                body: "var(--fs-body)",
                h3: "var(--fs-h3)",
                h2: "var(--fs-h2)",
                h1: "var(--fs-h1)",
                display: "var(--fs-display)",
            },
        },
    },
    plugins: [],
};
export default config;
