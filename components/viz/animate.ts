import { gsap } from "@/lib/gsap";
import type { Architecture } from "@/data/types";

/**
 * Builds a paused timeline that "constructs" the diagram: edges draw in,
 * nodes appear in flow order, packets fade in at the end.
 */
export function createVizReveal(svg: SVGSVGElement, arch: Architecture, opts: { withPackets?: boolean; restOpacity?: number } = {}) {
  const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.out" } });
  const order = [...arch.flow, ...arch.nodes.map((n) => n.id).filter((id) => !arch.flow.includes(id))];
  const nodeEls = order.map((id) => svg.querySelector<SVGGElement>(`[data-node="${id}"]`)).filter(Boolean) as SVGGElement[];
  const edgeEls = Array.from(svg.querySelectorAll<SVGPathElement>(".viz-edge"));
  const packetsGroup = svg.querySelector(".viz-packets");
  const edgeLabels = svg.querySelectorAll(".viz-edge-label");
  const restOpacity = opts.restOpacity ?? 0;

  gsap.set(nodeEls, { opacity: restOpacity, scale: restOpacity ? 0.97 : 0.92, transformOrigin: "50% 50%" });
  gsap.set(edgeEls, { drawSVG: "0%" });
  gsap.set(packetsGroup, { opacity: 0 });
  gsap.set(edgeLabels, { opacity: 0 });

  tl.to(edgeLabels, { opacity: 1, duration: 0.5, stagger: 0.1 }, 0.9);
  tl.to(nodeEls, { opacity: 1, scale: 1, duration: 0.6, stagger: 0.12 }, 0);
  tl.fromTo(edgeEls, { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.9, stagger: 0.1, ease: "power1.inOut" }, 0.25);
  if (opts.withPackets !== false && packetsGroup) tl.to(packetsGroup, { opacity: 1, duration: 0.5 }, ">-0.3");
  return tl;
}

/**
 * Infinite ambient animation: packets ride the flow path, nodes pulse as a
 * packet reaches them. Returns a kill function.
 */
export function createVizAmbient(svg: SVGSVGElement, arch: Architecture, opts: { speed?: number } = {}) {
  const flowEl = svg.querySelector<SVGPathElement>(".viz-flow");
  const packets = Array.from(svg.querySelectorAll<SVGGElement>(".viz-packet"));
  if (!flowEl || !packets.length || flowEl.getTotalLength() === 0) return () => {};

  const total = flowEl.getTotalLength();
  const duration = total / (opts.speed ?? 95);

  // cumulative fraction of the flow at which each node in the flow is reached
  const fractions: { id: string; f: number }[] = [{ id: arch.flow[0], f: 0 }];
  let acc = 0;
  for (let i = 0; i < arch.flow.length - 1; i++) {
    const seg = svg.querySelector<SVGPathElement>(`[data-edge="${arch.flow[i]}-${arch.flow[i + 1]}"]`);
    acc += seg ? seg.getTotalLength() : total / (arch.flow.length - 1);
    fractions.push({ id: arch.flow[i + 1], f: Math.min(1, acc / total) });
  }

  const master = gsap.timeline({ repeat: -1 });
  packets.forEach((packet, i) => {
    const tl = gsap.timeline();
    tl.set(packet, { opacity: 0 }, 0)
      .to(packet, { motionPath: { path: flowEl, align: flowEl, alignOrigin: [0.5, 0.5] }, duration, ease: "none" }, 0)
      .to(packet, { opacity: 1, duration: duration * 0.06 }, 0)
      .to(packet, { opacity: 0, duration: duration * 0.08 }, duration * 0.92);
    fractions.forEach(({ id, f }) => {
      const pulse = svg.querySelector(`[data-node="${id}"] .viz-node-pulse`);
      const dot = svg.querySelector(`[data-node="${id}"] .viz-node-dot`);
      if (pulse)
        tl.fromTo(pulse, { opacity: 0.85, scale: 1, transformOrigin: "50% 50%" }, { opacity: 0, scale: 1.08, duration: 0.9, ease: "power2.out" }, f * duration);
      if (dot) tl.fromTo(dot, { fill: "var(--color-accent)", r: 3.2 }, { fill: "var(--color-fg-3)", r: 2.2, duration: 1.2, ease: "power2.out" }, f * duration);
    });
    master.add(tl, (i * duration) / packets.length);
  });
  // ensure master spans a full cycle so all packets loop seamlessly
  master.to({}, { duration: 0.001 }, duration + ((packets.length - 1) * duration) / packets.length);

  return () => {
    master.kill();
    gsap.set(packets, { opacity: 0 });
  };
}
