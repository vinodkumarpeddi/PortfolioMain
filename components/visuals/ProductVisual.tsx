import type { Project } from "@/data/types";
import { ScaledFrame } from "./ScaledFrame";
import { PaymentScreen } from "./screens/PaymentScreen";
import { AnalyticsScreen } from "./screens/AnalyticsScreen";
import { SaasScreen } from "./screens/SaasScreen";
import { ExamScreen } from "./screens/ExamScreen";
import { GrillBotScreen } from "./screens/GrillBotScreen";
import { cn } from "@/lib/utils";

export const screenFor: Record<string, React.ComponentType> = {
  "payment-orchestrator": PaymentScreen,
  "event-driven-analytics": AnalyticsScreen,
  "exam-seating-management": ExamScreen,
  "multi-tenant-saas": SaasScreen,
  grillbot: GrillBotScreen,
};

/** Designed product screen for a project, scaled to fit its container. */
export function ProductVisual({ project, className }: { project: Project; className?: string; priority?: boolean }) {
  const Screen = screenFor[project.slug];
  if (!Screen) return null;
  return (
    <div className={cn("relative", className)}>
      <div aria-hidden className="pointer-events-none absolute -inset-6 rounded-[32px] bg-accent/[0.07] blur-3xl" />
      <ScaledFrame className="relative rounded-[22px]" label={`${project.title} — product screen (demo data)`}>
        <Screen />
      </ScaledFrame>
    </div>
  );
}
