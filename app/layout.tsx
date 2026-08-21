import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { profile } from "@/data/profile";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { ScrollStateProvider } from "@/components/providers/ScrollState";
import { HashScroll } from "@/components/providers/HashScroll";
import { Preloader } from "@/components/layout/Preloader";
import { Cursor } from "@/components/ui/Cursor";
import { Grain } from "@/components/ui/Grain";
import { FluidInk } from "@/components/ui/FluidInk";
import { Nav } from "@/components/layout/Nav";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { QuickBar } from "@/components/layout/QuickBar";
import { MotionProvider } from "@/components/providers/MotionProvider";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

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
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  category: "technology",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0c",
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
  // required for env(safe-area-inset-*) to report real values on notched phones
  viewportFit: "cover",
};

/**
 * Runs before the body is parsed, so the splash — which ships in the server HTML — either owns
 * the first painted frame or is gone before one exists. This cannot wait for hydration: a class
 * added after React boots lets the home page show first, which is the one thing the intro is
 * there to prevent.
 */
const INTRO_BOOT = `try{var h=document.documentElement,s=null;try{s=sessionStorage.getItem("vk-intro-seen")}catch(e){}
if(s){h.className+=" intro-done"}else{h.className+=" intro-lock";
try{if(matchMedia("(prefers-reduced-motion: reduce)").matches)h.className+=" intro-still"}catch(e){}}}catch(e){}`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: INTRO_BOOT }} />
        <noscript dangerouslySetInnerHTML={{ __html: "<style>.splash{display:none}</style>" }} />
      </head>
      <body className="min-h-svh">
        <Preloader />
        <MotionProvider>
          <SmoothScroll>
            <ScrollStateProvider>
              <HashScroll />
              <Nav />
              <ScrollProgress />
              <QuickBar />
              {children}
              <Cursor />
              <FluidInk />
              <Grain />
            </ScrollStateProvider>
          </SmoothScroll>
        </MotionProvider>
      </body>
    </html>
  );
}
