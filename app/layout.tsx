import type { Metadata } from "next";
import { Inter, Space_Mono, Source_Serif_4, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeContext";
import Navbar from "@/components/Navbar";
import DiscordLayout from "@/components/DiscordLayout";

// Font configurations
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

import Footer from "@/components/Footer";
import ConsoleEffect from "@/components/ConsoleEffect";

export const metadata: Metadata = {
  title: "Aedwon — A studio of one.",
  description: "Web solutions and community systems. A brand sells twice — once to the stranger, once to the regular. I build for both sales.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${spaceMono.variable} ${sourceSerif.variable} ${ibmPlexMono.variable}`}>
        <ThemeProvider>
          <div className="min-h-screen bg-background text-foreground font-theme transition-colors duration-300 flex flex-col">
            {/* Skip to main content link for keyboard users */}
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-accent focus:text-white focus:rounded"
            >
              Skip to main content
            </a>
            <ConsoleEffect />
            <Navbar />
            <main id="main-content" className="pt-[var(--nav-height)] flex-grow" role="main">
              <DiscordLayout>
                {children}
              </DiscordLayout>
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

