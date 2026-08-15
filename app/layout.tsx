import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { profile } from "@/data/profile";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { ScrollStateProvider } from "@/components/providers/ScrollState";
import { Cursor } from "@/components/ui/Cursor";
import { Grain } from "@/components/ui/Grain";
import { Nav } from "@/components/layout/Nav";
import { ScrollProgress } from "@/components/layout/ScrollProgress";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

const title = `${profile.name} — Software Engineer`;
const description =
  "Software engineer building full-stack products and the backend systems behind them: payments, event-driven services, multi-tenant SaaS, real-time systems. Node.js, PostgreSQL, Redis, RabbitMQ, React, Next.js, Docker.";

export const metadata: Metadata = {
  metadataBase: new URL(profile.siteUrl),
  title: { default: title, template: `%s — ${profile.name}` },
  description,
  applicationName: profile.name,
  authors: [{ name: profile.name, url: profile.siteUrl }],
  creator: profile.name,
  keywords: [
    "Vinod Kumar Peddi",
    "software engineer",
    "full-stack developer",
    "backend engineer",
    "distributed systems",
    "Node.js",
    "PostgreSQL",
    "Redis",
    "RabbitMQ",
    "React",
    "Next.js",
    "TypeScript",
    "Docker",
    "portfolio",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: profile.siteUrl,
    siteName: profile.name,
    title,
    description,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    creator: "@vinod_kumar_200",
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  category: "technology",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0c",
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="min-h-svh">
        <SmoothScroll>
          <ScrollStateProvider>
            <Nav />
            <ScrollProgress />
            {children}
            <Cursor />
            <Grain />
          </ScrollStateProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
