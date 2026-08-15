"use client";

import { forwardRef, useMemo } from "react";
import type { Architecture, NodeKind } from "@/data/types";
import { layoutArchitecture, NODE_H, NODE_W } from "./geometry";
import { cn } from "@/lib/utils";

type AltLabel = { label: string; sub?: string };

type Props = {
  architecture: Architecture;
  /** alternative labels, matched to nodes by index — used for scroll-morphs */
  altLabels?: AltLabel[];
  className?: string;
  /** render packets (animated by parent or by ambient CSS) */
  packets?: number;
  id?: string;
  title?: string;
  desc?: string;
};

function Glyph({ kind }: { kind: NodeKind }) {
  const s = { fill: "none", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (kind) {
    case "client":
      return (
        <g {...s}>
          <rect x="2" y="3" width="14" height="11" rx="2" />
          <path d="M2 6.5h14" />
        </g>
      );
    case "queue":
      return (
        <g {...s}>
          <path d="M2 5h14M2 9h10M2 13h6" />
        </g>
      );
    case "worker":
      return (
        <g {...s}>
          <circle cx="9" cy="9" r="2.5" />
          <path d="M9 2v2.2M9 13.8V16M2 9h2.2M13.8 9H16M4 4l1.6 1.6M12.4 12.4 14 14M4 14l1.6-1.6M12.4 5.6 14 4" />
        </g>
      );
    case "db":
      return (
        <g {...s}>
          <ellipse cx="9" cy="4.5" rx="6" ry="2.2" />
          <path d="M3 4.5v9c0 1.2 2.7 2.2 6 2.2s6-1 6-2.2v-9M3 9c0 1.2 2.7 2.2 6 2.2s6-1 6-2.2" />
        </g>
      );
    case "external":
      return (
        <g {...s}>
          <path d="M7 3H3v12h12v-4M10 3h5v5M15 3 8 10" />
        </g>
      );
    case "infra":
      return (
        <g {...s}>
          <rect x="2" y="3" width="14" height="4.5" rx="1.2" />
          <rect x="2" y="10.5" width="14" height="4.5" rx="1.2" />
          <path d="M5 5.25h.01M5 12.75h.01" />
        </g>
      );
    default:
      return (
        <g {...s}>
          <rect x="3" y="3" width="12" height="12" rx="2.5" />
          <path d="M6.5 9h5" />
        </g>
      );
  }
}

export const SystemViz = forwardRef<SVGSVGElement, Props>(function SystemViz(
  { architecture, altLabels, className, packets = 3, id, title, desc },
  ref,
) {
  const layout = useMemo(() => layoutArchitecture(architecture), [architecture]);
  const uid = id ?? "viz";

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      className={cn("h-auto w-full overflow-visible", className)}
      role="img"
      aria-labelledby={title ? `${uid}-title` : undefined}
      aria-describedby={desc ? `${uid}-desc` : undefined}
      data-viz
    >
      {title && <title id={`${uid}-title`}>{title}</title>}
      {desc && <desc id={`${uid}-desc`}>{desc}</desc>}
      <defs>
        <radialGradient id={`${uid}-glow`}>
          <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${uid}-chip`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.015)" />
        </linearGradient>
      </defs>

      {/* edges */}
      <g className="viz-edges" fill="none" stroke="var(--color-line-2)" strokeWidth="1">
        {layout.edges.map((e) => (
          <g key={e.id}>
            <path
              id={`${uid}-${e.id}`}
              d={e.d}
              className="viz-edge"
              strokeDasharray={e.dashed ? "3 5" : undefined}
              data-edge={`${e.from}-${e.to}`}
            />
            {e.label && (
              <EdgeLabel d={e.d} label={e.label} />
            )}
          </g>
        ))}
      </g>

      {/* hidden flow path packets travel along */}
      <path id={`${uid}-flow`} d={layout.flowD} fill="none" stroke="none" className="viz-flow" />

      {/* nodes */}
      <g className="viz-nodes">
        {architecture.nodes.map((n, i) => {
          const p = layout.pos[n.id];
          const alt = altLabels?.[i];
          return (
            <g key={n.id} className="viz-node" data-node={n.id} transform={`translate(${p.x} ${p.y})`} style={{ transformOrigin: `${p.x + NODE_W / 2}px ${p.y + NODE_H / 2}px` }}>
              <rect
                className="viz-node-pulse"
                x={-4}
                y={-4}
                width={NODE_W + 8}
                height={NODE_H + 8}
                rx={14}
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth="1"
                opacity="0"
              />
              <rect className="viz-node-box" width={NODE_W} height={NODE_H} rx={11} fill="var(--color-bg-2)" stroke="var(--color-line-2)" strokeWidth="1" />
              <rect width={NODE_W} height={NODE_H} rx={11} fill={`url(#${uid}-chip)`} />
              <g transform="translate(14 18)" className="viz-node-glyph" color="var(--color-fg-2)">
                <Glyph kind={n.kind} />
              </g>
              <g className="viz-label viz-label-main">
                <text x={42} y={23} fontSize="13.5" fontWeight="500" fill="var(--color-fg-1)" fontFamily="var(--font-sans)" letterSpacing="-0.01em">
                  {n.label}
                </text>
                {n.sub && (
                  <text x={42} y={39} fontSize="9.5" fill="var(--color-fg-3)" fontFamily="var(--font-mono)" letterSpacing="0.06em">
                    {n.sub.toUpperCase()}
                  </text>
                )}
              </g>
              {alt && (
                <g className="viz-label viz-label-alt" opacity="0">
                  <text x={42} y={23} fontSize="13.5" fontWeight="500" fill="var(--color-fg-1)" fontFamily="var(--font-sans)" letterSpacing="-0.01em">
                    {alt.label}
                  </text>
                  {alt.sub && (
                    <text x={42} y={39} fontSize="9.5" fill="var(--color-fg-3)" fontFamily="var(--font-mono)" letterSpacing="0.06em">
                      {alt.sub.toUpperCase()}
                    </text>
                  )}
                </g>
              )}
              <circle className="viz-node-dot" cx={NODE_W - 12} cy={12} r={2.2} fill="var(--color-fg-3)" />
            </g>
          );
        })}
      </g>

      {/* packets */}
      <g className="viz-packets">
        {Array.from({ length: packets }).map((_, i) => (
          <g key={i} className="viz-packet" opacity="0">
            <circle r="9" fill={`url(#${uid}-glow)`} opacity="0.55" />
            <circle r="2.6" fill="var(--color-accent)" />
          </g>
        ))}
      </g>
    </svg>
  );
});

function EdgeLabel({ d, label }: { d: string; label: string }) {
  const nums = d.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? [];
  if (nums.length < 8) return null;
  const [x1, y1, , , , , x2, y2] = nums;
  const x = (x1 + x2) / 2;
  const y = (y1 + y2) / 2;
  return (
    <g transform={`translate(${x} ${y})`} className="viz-edge-label">
      <rect x={-label.length * 3.4 - 6} y={-8} width={label.length * 6.8 + 12} height={16} rx={8} fill="var(--color-bg-1)" stroke="var(--color-line-1)" />
      <text textAnchor="middle" y={3.5} fontSize="8.5" fill="var(--color-fg-3)" fontFamily="var(--font-mono)" letterSpacing="0.08em">
        {label.toUpperCase()}
      </text>
    </g>
  );
}
