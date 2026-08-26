import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import "./tech-brand-icons.css";
import { ThemeProvider } from "@/components/ThemeContext";
import DiscordLayout from "@/components/DiscordLayout";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import {
  PERSON_JSON_LD,
  PERSON_NAME,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site-content";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${SITE_NAME} — ${PERSON_NAME}`,
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${SITE_NAME} — ${PERSON_NAME}`,
    description: SITE_DESCRIPTION,
    url: "/",
    siteName: SITE_NAME,
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — ${PERSON_NAME}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${PERSON_NAME}`,
    description: SITE_DESCRIPTION,
    images: ["/opengraph-image"],
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
  },
};

const personJsonLd = JSON.stringify(PERSON_JSON_LD).replace(/</g, "\\u003c");

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="default" data-mode="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: personJsonLd }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var storedTheme = localStorage.getItem('aedwon-theme');
                  var storedMode = localStorage.getItem('aedwon-mode');
                  var theme = storedTheme === 'neobrutalist' || storedTheme === 'discord' || storedTheme === 'default'
                    ? storedTheme
                    : 'default';
                  var mode = storedMode === 'system' || storedMode === 'light' || storedMode === 'dark'
                    ? storedMode
                    : 'dark';
                  var effectiveMode = mode === 'system'
                    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
                    : mode;
                  if (theme === 'discord') effectiveMode = 'dark';
                  if (theme === 'neobrutalist') effectiveMode = 'light';
                  document.documentElement.setAttribute('data-theme', theme);
                  document.documentElement.setAttribute('data-mode', effectiveMode);
                } catch (error) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <a
            href="#main-content"
            className="fixed left-4 -top-20 z-[100] rounded-md bg-[var(--bg-card)] px-4 py-2 text-[14px] font-semibold text-[var(--text-primary)] shadow-lg outline outline-2 outline-offset-2 outline-[var(--accent)] transition-[top] focus:top-4 motion-reduce:transition-none"
          >
            Skip to main content
          </a>
          <DiscordLayout>
            <div
              id="portfolio-main-surface"
              className="max-w-[860px] mx-auto px-6 sm:px-8 pt-8 min-h-screen flex flex-col justify-between transition-transform"
            >
              <div>
                <Navbar />
                <main id="main-content" tabIndex={-1}>
                  <PageTransition>{children}</PageTransition>
                </main>
              </div>
              <Footer />
            </div>
          </DiscordLayout>
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
