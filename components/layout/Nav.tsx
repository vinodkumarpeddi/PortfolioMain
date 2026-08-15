"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import { navigation, profile, sections } from "@/data/profile";
import { useScrollState } from "@/components/providers/ScrollState";
import { cn } from "@/lib/utils";
import { ease, spring } from "@/lib/motion";
import { ArrowUpRight } from "@/components/ui/Icons";
import { Magnetic } from "@/components/ui/Magnetic";

export function Nav() {
  const { active, index, total, scrolled } = useScrollState();
  const [open, setOpen] = useState(false);
  const lenis = useLenis();
  const pathname = usePathname();
  const home = pathname === "/";
  const hrefFor = (id: string) => (home ? `#${id}` : `/#${id}`);

  useEffect(() => {
    if (open) lenis?.stop();
    else lenis?.start();
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open, lenis]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const current = sections[index];

  return (
    <>
      <a
        href={home ? "#work" : "#main"}
        className="label fixed left-4 top-4 z-[90] -translate-y-24 rounded-full bg-fg-1 px-4 py-3 text-accent-ink focus:translate-y-0"
      >
        Skip to content
      </a>

      <header className="pointer-events-none fixed inset-x-0 top-0 z-[80]">
        <div
          className={cn(
            "mx-auto flex items-center justify-between transition-[max-width,padding,margin,background-color,border-color,backdrop-filter,transform] duration-[var(--duration-slow)] ease-[var(--ease-standard)]",
            scrolled
              ? "mt-3 max-w-[min(62rem,calc(100%-1.5rem))] rounded-full border border-line-1 bg-bg-1/70 py-1.5 pl-4 pr-1.5 backdrop-blur-xl [box-shadow:var(--shadow-float)]"
              : "mt-0 max-w-none border border-transparent bg-transparent px-[var(--spacing-gutter)] py-5",
          )}
        >
          <Link
            href="/"
            className="pointer-events-auto flex items-center gap-3 text-fg-1"
            aria-label={`${profile.name} — home`}
          >
            <span className="relative grid h-7 w-7 place-items-center">
              <span className="absolute inset-0 rounded-full border border-line-2" />
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="whitespace-nowrap text-[13px] font-semibold tracking-[-0.01em]">
                {profile.name}
              </span>
              <span
                className={cn(
                  "label mt-1 text-fg-3 transition-opacity",
                  scrolled && "hidden",
                )}
              >
                Software Engineer
              </span>
            </span>
          </Link>

          <nav
            className="pointer-events-auto hidden items-center gap-1 lg:flex"
            aria-label="Primary"
          >
            <span
              className="label mr-3 hidden min-w-[9.5rem] text-fg-3 lg:block"
              aria-hidden
            >
              {scrolled && home && (
                <span
                  key={current.id}
                  className="inline-block [animation:fade-in_400ms_var(--ease-out-expo)]"
                >
                  <span className="text-accent">{current.index}</span> /{" "}
                  {current.label}
                </span>
              )}
            </span>
            {navigation.map((item) => {
              const isActive = home && active === item.id;
              return (
                <a
                  key={item.id}
                  href={hrefFor(item.id)}
                  className={cn(
                    "relative rounded-full px-3 py-2 text-[13px] font-medium tracking-[-0.005em] transition-colors duration-[var(--duration-base)]",
                    isActive ? "text-fg-1" : "text-fg-2 hover:text-fg-1",
                  )}
                  aria-current={isActive ? "location" : undefined}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-full bg-fg-1/[0.06]"
                      transition={spring.snappy}
                    />
                  )}
                  <span className="relative">{item.label}</span>
                </a>
              );
            })}
            <Magnetic strength={5} className="ml-2">
              <a
                href={profile.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex h-9 items-center gap-1.5 rounded-full bg-fg-1 pl-4 pr-3 text-[13px] font-medium text-accent-ink transition-colors hover:bg-white"
              >
                Resume
                <ArrowUpRight className="transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </Magnetic>
          </nav>

          <span
            className={cn("label pointer-events-none mr-2 hidden items-center gap-1.5 text-fg-3 transition-opacity duration-300 max-lg:flex", scrolled && !open ? "opacity-100" : "opacity-0")}
            aria-hidden
          >
            <span key={current.id} className="inline-block [animation:fade-in_400ms_var(--ease-out-expo)]">
              <span className="text-accent">{current.index}</span> · {current.label}
            </span>
          </span>
          <button
            type="button"
            className="pointer-events-auto relative grid h-10 w-10 place-items-center rounded-full border border-line-1 bg-bg-2/60 backdrop-blur lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="relative block h-3 w-4">
              <motion.span
                className="absolute left-0 top-0 block h-px w-4 bg-fg-1"
                animate={open ? { y: 5.5, rotate: 45 } : { y: 0, rotate: 0 }}
                transition={spring.snappy}
              />
              <motion.span
                className="absolute left-0 top-[11px] block h-px w-4 bg-fg-1"
                animate={open ? { y: -5.5, rotate: -45 } : { y: 0, rotate: 0 }}
                transition={spring.snappy}
              />
            </span>
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-0 z-[70] flex flex-col bg-bg-0/95 px-[var(--spacing-gutter)] pb-10 pt-28 backdrop-blur-2xl lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.25 } }}
            transition={{ duration: 0.35, ease: ease.standard }}
          >
            <nav aria-label="Mobile" className="flex flex-1 flex-col gap-1">
              {[
                { id: "intro", label: "Intro", index: "01" },
                ...navigation,
              ].map((item, i) => (
                <motion.a
                  key={item.id}
                  href={hrefFor(item.id)}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: {
                      delay: 0.06 + i * 0.05,
                      duration: 0.6,
                      ease: ease.outExpo,
                    },
                  }}
                  exit={{ opacity: 0, y: 8, transition: { duration: 0.15 } }}
                  className="flex items-baseline gap-4 border-b border-line-1 py-4"
                >
                  <span className="label w-6 text-accent">{item.index}</span>
                  <span
                    className={cn(
                      "text-h2",
                      active === item.id ? "text-fg-1" : "text-fg-2",
                    )}
                  >
                    {item.label}
                  </span>
                </motion.a>
              ))}
            </nav>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.4 } }}
              className="flex flex-col gap-5"
            >
              <ul
                className="label flex flex-wrap gap-x-5 gap-y-2 text-fg-3"
                aria-label="Elsewhere"
              >
                {profile.socials.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 py-1 transition-colors hover:text-fg-1"
                    >
                      {s.label} <ArrowUpRight />
                    </a>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between gap-4">
                <a
                  href={`mailto:${profile.email}`}
                  className="break-all text-sm text-fg-2"
                >
                  {profile.email}
                </a>
                <a
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center gap-1.5 rounded-full bg-fg-1 px-4 text-sm font-medium text-accent-ink"
                >
                  Resume <ArrowUpRight />
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <span className="sr-only" aria-live="polite">
        {`Section ${index + 1} of ${total}: ${current.label}`}
      </span>
    </>
  );
}
