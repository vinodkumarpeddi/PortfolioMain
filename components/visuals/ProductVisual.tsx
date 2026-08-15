import type { Project } from "@/data/types";
import { ScaledFrame } from "./ScaledFrame";
import { PaymentScreen } from "./screens/PaymentScreen";
import { AnalyticsScreen } from "./screens/AnalyticsScreen";
import { SaasScreen } from "./screens/SaasScreen";
import { ExamScreen } from "./screens/ExamScreen";
import { GrillBotScreen } from "./screens/GrillBotScreen";
import { cn } from "@/lib/utils";
import { ScreenLightbox } from "./ScreenLightbox";

export const screenFor: Record<string, React.ComponentType> = {
  "payment-orchestrator": PaymentScreen,
  "event-driven-analytics": AnalyticsScreen,
  "exam-seating-management": ExamScreen,
  "multi-tenant-saas": SaasScreen,
  grillbot: GrillBotScreen,
};

/**
 * Designed product screen for a project, scaled to fit its container.
 * `pan` (default) crops to a legible zoom on phones and lets the viewer swipe across it;
 * `fit` always shows the whole frame — used where the composition is fixed, like the hero.
 */
export function ProductVisual({ project, className, variant = "pan" }: { project: Project; className?: string; priority?: boolean; variant?: "pan" | "fit" }) {
  const Screen = screenFor[project.slug];
  if (!Screen) return null;
  const label = `${project.title} — product screen (demo data)`;
  const frame = (
    <ScaledFrame className="relative rounded-[22px]" label={label}>
      <Screen />
    </ScaledFrame>
  );
  return (
    <div className={cn("relative", className)}>
      <div aria-hidden className="pointer-events-none absolute -inset-3 rounded-[32px] sm:-inset-6 bg-accent/[0.07] blur-3xl" />
      {variant === "pan" ? (
        <>
          <div
            className="no-scrollbar relative overflow-x-auto overscroll-x-contain overflow-y-hidden rounded-[22px] sm:overflow-visible"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <div className="w-[170%] sm:w-full">{frame}</div>
          </div>
          <div className="relative mt-3 flex items-center justify-between gap-3 sm:hidden">
            <span className="label text-fg-3" aria-hidden>
              Swipe to pan
            </span>
            <ScreenLightbox title={project.title} trigger="inline">
              <ScaledFrame className="rounded-2xl" label={label}>
                <Screen />
              </ScaledFrame>
            </ScreenLightbox>
          </div>
        </>
      ) : (
        <>
          {frame}
          <ScreenLightbox title={project.title}>
            <ScaledFrame className="rounded-2xl" label={label}>
              <Screen />
            </ScaledFrame>
          </ScreenLightbox>
        </>
      )}
    </div>
  );
}
