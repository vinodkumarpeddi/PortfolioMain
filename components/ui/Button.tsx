import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Magnetic } from "./Magnetic";

type Variant = "primary" | "ghost" | "outline";

type Props = {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
  external?: boolean;
  download?: boolean;
  cursor?: string;
  icon?: ReactNode;
  magnetic?: boolean;
  size?: "sm" | "md" | "lg";
};

const styles: Record<Variant, string> = {
  primary: "bg-fg-1 text-accent-ink hover:bg-white",
  outline: "border border-line-2 text-fg-1 hover:border-fg-1/60 hover:bg-fg-1/[0.04]",
  ghost: "text-fg-2 hover:text-fg-1",
};

const sizes = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-base",
};

export function Button({
  href,
  children,
  variant = "primary",
  className,
  external,
  download,
  cursor,
  icon,
  magnetic = true,
  size = "md",
}: Props) {
  const isExternal = external ?? /^https?:\/\//.test(href);
  const cls = cn(
    "group/btn inline-flex items-center gap-2 rounded-full font-medium tracking-[-0.01em] transition-[background-color,border-color,color,transform] duration-[var(--duration-base)] ease-[var(--ease-standard)] active:scale-[0.97] select-none whitespace-nowrap",
    styles[variant],
    sizes[size],
    className,
  );
  const inner = (
    <>
      <span>{children}</span>
      {icon && (
        <span className="grid place-items-center text-[1.05em] transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5">
          {icon}
        </span>
      )}
    </>
  );
  const link = isExternal || download ? (
    <a
      href={href}
      className={cls}
      target={download ? undefined : "_blank"}
      rel={download ? undefined : "noopener noreferrer"}
      download={download ? "" : undefined}
      data-cursor={cursor}
    >
      {inner}
    </a>
  ) : (
    <Link href={href} className={cls} data-cursor={cursor}>
      {inner}
    </Link>
  );
  return magnetic ? <Magnetic strength={7}>{link}</Magnetic> : link;
}
