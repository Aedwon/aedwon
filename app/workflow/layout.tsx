import type { Metadata } from "next";
import localFont from "next/font/local";
import "./workflow.css";

// Goeist, a rounded take on Geist, self-hosted under the SIL Open Font License (see fonts/OFL.txt).
const goeist = localFont({
  src: "./fonts/Goeist-wght.woff2",
  weight: "100 900",
  style: "normal",
  display: "swap",
  variable: "--font-goeist",
});

export const metadata: Metadata = {
  title: "How I work with agents",
  robots: { index: false, follow: false },
  alternates: { canonical: "/workflow" },
};

export default function WorkflowLayout({ children }: { children: React.ReactNode }) {
  return <div className={`wf ${goeist.variable}`}>{children}</div>;
}
