import { ThemeProvider } from "@/components/ThemeContext";
import DiscordLayout from "@/components/DiscordLayout";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";

// The v2 chrome, kept for the legacy routes (/projects, /blogs, /privacy, ...)
// that the v3 redesign does not take over yet.
export default function V2Layout({ children }: { children: React.ReactNode }) {
  return (
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
  );
}
