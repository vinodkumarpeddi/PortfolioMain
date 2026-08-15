import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * The mark: a fire-breathing dragon whose body and tail form a V. Rendered from artwork rather
 * than paths, so callers size it with width/height classes as before.
 */
export function Logo({ className, priority }: { className?: string; priority?: boolean }) {
  return (
    <Image
      src="/brand/dragon-512.png"
      alt=""
      aria-hidden
      width={512}
      height={512}
      priority={priority}
      className={cn("select-none object-contain", className)}
    />
  );
}

/** Mark plus wordmark, for the nav and the splash. */
export function Logotype({ className, sub }: { className?: string; sub?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <Logo className="h-8 w-8 shrink-0" />
      <span className="flex min-w-0 flex-col leading-none">
        <span className="truncate text-[13px] font-semibold tracking-[-0.02em]">Vinod Kumar Peddi</span>
        {sub && <span className="label mt-1 truncate text-fg-3">{sub}</span>}
      </span>
    </span>
  );
}
