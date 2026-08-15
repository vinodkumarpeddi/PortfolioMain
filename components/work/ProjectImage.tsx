"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import type { ProjectImage as ImageType } from "@/data/types";
import { ArrowUpRight } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

type Props = {
  image: ImageType;
  href?: string;
  label?: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  /** scroll-driven reveal (scale/blur/radius) */
  reveal?: boolean;
};

export function ProjectImage({ image, href, label = "Explore project", className, priority, sizes = "(min-width: 1024px) 50vw, 100vw", reveal = true }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!reveal || !ref.current) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          ref.current,
          { scale: 0.86, opacity: 0.4, filter: "blur(6px)", borderRadius: 32 },
          {
            scale: 1,
            opacity: 1,
            filter: "blur(0px)",
            borderRadius: 14,
            ease: "none",
            scrollTrigger: { trigger: ref.current, start: "top 92%", end: "top 38%", scrub: 0.6 },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  const inner = (
    <>
      <Image
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        sizes={sizes}
        priority={priority}
        className="h-full w-full object-cover object-top transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover/img:scale-[1.035]"
      />
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg-0/60 via-transparent to-transparent opacity-0 transition-opacity duration-[var(--duration-slow)] group-hover/img:opacity-100" />
      {href && (
        <span className="pointer-events-none absolute bottom-4 left-4 inline-flex translate-y-2 items-center gap-1.5 rounded-full bg-fg-1 px-3.5 py-2 text-[13px] font-medium text-accent-ink opacity-0 transition-[opacity,transform] duration-[var(--duration-slow)] ease-[var(--ease-out-expo)] group-hover/img:translate-y-0 group-hover/img:opacity-100">
          {label} <ArrowUpRight />
        </span>
      )}
    </>
  );

  return (
    <div
      ref={ref}
      className={cn("group/img relative overflow-hidden rounded-[14px] border border-line-1 bg-bg-2 [box-shadow:var(--shadow-soft)] will-change-transform", className)}
    >
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" data-cursor="Explore" className="block h-full w-full" aria-label={`${label}: ${image.alt}`}>
          {inner}
        </a>
      ) : (
        inner
      )}
    </div>
  );
}
