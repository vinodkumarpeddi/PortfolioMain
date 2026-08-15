import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ArrowRight, ArrowUpRight } from "./Icons";

type Props = {
  href: string;
  children: ReactNode;
  className?: string;
  external?: boolean;
  cursor?: string;
  muted?: boolean;
};

export function ArrowLink({ href, children, className, external, cursor, muted }: Props) {
  const isExternal = external ?? /^https?:\/\//.test(href);
  const cls = cn(
    "group/al inline-flex items-center gap-1.5 text-sm font-medium tracking-[-0.01em] transition-colors duration-[var(--duration-base)]",
    muted ? "text-fg-2 hover:text-fg-1" : "text-fg-1",
    className,
  );
  const Icon = isExternal ? ArrowUpRight : ArrowRight;
  const content = (
    <>
      <span className="link-underline">{children}</span>
      <Icon className="text-[1.05em] transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] group-hover/al:translate-x-0.5 group-hover/al:-translate-y-px" />
    </>
  );
  return isExternal ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls} data-cursor={cursor}>
      {content}
    </a>
  ) : (
    <Link href={href} className={cls} data-cursor={cursor}>
      {content}
    </Link>
  );
}
