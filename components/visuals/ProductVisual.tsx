import Image from "next/image";
import type { Project } from "@/data/types";
import type { GlassShape } from "@/components/three/HeroObject";
import { GlassVisual } from "./GlassVisual";
import { cn } from "@/lib/utils";

const shapes: Record<string, GlassShape> = {
  "payment-orchestrator": "torus",
  "event-driven-analytics": "gem",
  "multi-tenant-saas": "cubes",
};

/** Picks the visual for a project: a real screenshot, or a 3D glass object. */
export function ProductVisual({ project, className, priority }: { project: Project; className?: string; compact?: boolean; priority?: boolean }) {
  if (project.image) {
    return (
      <div className={cn("relative aspect-[16/10] overflow-hidden rounded-[22px] border border-line-1 bg-bg-2", className)}>
        <Image src={project.image.src} alt={project.image.alt} width={project.image.width} height={project.image.height} priority={priority} sizes="(min-width: 1024px) 60vw, 100vw" className="h-full w-full object-cover object-top" />
      </div>
    );
  }
  const shape = shapes[project.slug];
  if (!shape) return null;
  return <GlassVisual shape={shape} className={className} label={`${project.title} — abstract 3D visual`} />;
}
