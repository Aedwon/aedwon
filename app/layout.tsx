import type { Metadata } from "next";
import "./globals.css";
import "./tech-brand-icons.css";
import { ThemeProvider } from "@/components/ThemeContext";
import DiscordLayout from "@/components/DiscordLayout";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";

export const metadata: Metadata = {
  title: "Aedwon",
  description: "Computer Science at UP Diliman on a DOST Merit Scholarship. Software builds, client-side tools, and platforms.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    apple: [
      { url: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="default" data-mode="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" />
        {/* Anti-Flash Theme Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('aedwon-theme') || 'default';
                  const mode = localStorage.getItem('aedwon-mode') || 'dark';
                  let effectiveMode = mode === 'system' 
                    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
                    : mode;
                  if (theme === 'discord') effectiveMode = 'dark';
                  if (theme === 'neobrutalist') effectiveMode = 'light';
                  document.documentElement.setAttribute('data-theme', theme);
                  document.documentElement.setAttribute('data-mode', effectiveMode);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <DiscordLayout>
            <div
              id="portfolio-main-surface"
              className="max-w-[860px] mx-auto px-6 sm:px-8 pt-8 min-h-screen flex flex-col justify-between transition-transform"
            >
              <div>
                <Navbar />
                <main>
                  <PageTransition>{children}</PageTransition>
                </main>
              </div>
              <Footer />
            </div>
          </DiscordLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
