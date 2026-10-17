import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ThemeContext";

export const metadata: Metadata = {
  title: "Logo Sizing — Aedwon",
  robots: { index: false, follow: false },
};

export default function LogoSizingLayout({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
