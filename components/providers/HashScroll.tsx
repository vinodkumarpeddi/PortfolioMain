"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLenis } from "lenis/react";
import { ScrollTrigger } from "@/lib/gsap";

/**
 * Pinned sections add scroll distance after hydration, so the browser's own
 * hash jump lands in the wrong place. Re-resolve the hash once layout settles.
 */
export function HashScroll() {
  const pathname = usePathname();
  const lenis = useLenis();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || hash.length < 2) return;
    let cancelled = false;
    const go = () => {
      if (cancelled) return;
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (!el) return;
      ScrollTrigger.refresh();
      const top = el.getBoundingClientRect().top + window.scrollY;
      if (lenis) lenis.scrollTo(top, { immediate: true, force: true });
      else window.scrollTo({ top, behavior: "auto" });
    };
    const t1 = window.setTimeout(go, 120);
    const t2 = window.setTimeout(go, 700);
    document.fonts?.ready.then(() => window.setTimeout(go, 50));
    return () => {
      cancelled = true;
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [pathname, lenis]);

  return null;
}
