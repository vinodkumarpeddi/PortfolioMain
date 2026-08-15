import Image from "next/image";
import type { Project } from "@/data/types";
import { ScaledFrame } from "./ScaledFrame";
import { PaymentScreen } from "./screens/PaymentScreen";
import { AnalyticsScreen } from "./screens/AnalyticsScreen";
import { SaasScreen } from "./screens/SaasScreen";
import { cn } from "@/lib/utils";

/** Picks the visual for a project: a real screenshot, or a designed product screen. */
export function ProductVisual({ project, className, priority }: { project: Project; className?: string; priority?: boolean }) {
  if (project.image) {
    return (
      <div className={cn("relative aspect-[16/10] overflow-hidden rounded-[22px] border border-line-1 bg-bg-2 [box-shadow:var(--shadow-soft)]", className)}>
        <Image src={project.image.src} alt={project.image.alt} width={project.image.width} height={project.image.height} priority={priority} sizes="(min-width: 1024px) 60vw, 100vw" className="h-full w-full object-cover object-top" />
      </div>
    );
  }
  const screen =
    project.slug === "payment-orchestrator" ? <PaymentScreen /> : project.slug === "event-driven-analytics" ? <AnalyticsScreen /> : project.slug === "multi-tenant-saas" ? <SaasScreen /> : null;
  if (!screen) return null;
  return (
    <div className={cn("relative", className)}>
      <div aria-hidden className="pointer-events-none absolute -inset-6 rounded-[32px] bg-accent/[0.07] blur-3xl" />
      <ScaledFrame className="relative rounded-[22px]" label={`${project.title} — product screen (demo data)`}>
        {screen}
      </ScaledFrame>
    </div>
  );
}
