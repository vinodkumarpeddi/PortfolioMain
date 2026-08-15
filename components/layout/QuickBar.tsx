"use client";

import Link from "next/link";
import { useScrollState } from "@/components/providers/ScrollState";
import { ArrowUpRight } from "@/components/ui/Icons";
import { profile } from "@/data/profile";
import { cn } from "@/lib/utils";

/**
 * Phone-only bottom pill: the two actions worth reaching with a thumb. The wrapper stays
 * pointer-events-none so it never eats taps beside the pill.
 */
export function QuickBar() {
  const { scrolled, active } = useScrollState();
  const onContact = active === "contact";

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0 z-[75] flex justify-center pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-[opacity,transform] duration-[var(--duration-slow)] ease-[var(--ease-out-expo)] lg:hidden",
        scrolled && !onContact ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0",
      )}
      aria-hidden={!scrolled || onContact}
    >
      <nav
        className="pointer-events-auto flex items-center gap-1 rounded-full border border-line-1 bg-bg-1/85 p-1 backdrop-blur-xl [box-shadow:var(--shadow-float)]"
        aria-label="Quick actions"
      >
        <Link
          href="/#work"
          className={cn(
            "label inline-flex h-11 items-center rounded-full px-4 transition-colors active:scale-95",
            active === "work" ? "bg-fg-1 text-accent-ink" : "text-fg-2",
          )}
        >
          Work
        </Link>
        <Link href="/#contact" className="label inline-flex h-11 items-center rounded-full px-4 text-fg-2 transition-colors active:scale-95">
          Contact
        </Link>
        <a
          href={profile.resumeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="label inline-flex h-11 items-center gap-1.5 rounded-full bg-fg-1 px-4 text-accent-ink transition-transform active:scale-95"
        >
          Resume <ArrowUpRight />
        </a>
      </nav>
    </div>
  );
}
