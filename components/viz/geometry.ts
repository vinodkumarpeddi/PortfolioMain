import type { ArchEdge, ArchNode, Architecture } from "@/data/types";

export const NODE_W = 156;
export const NODE_H = 54;
export const PAD_X = 28;
export const PAD_Y = 34;

export type Layout = {
  width: number;
  height: number;
  colW: number;
  rowH: number;
  pos: Record<string, { x: number; y: number }>;
  edges: (ArchEdge & { d: string; id: string })[];
  flowD: string;
};

export function layoutArchitecture(arch: Architecture): Layout {
  const colW = 200;
  const rowH = 118;
  const width = PAD_X * 2 + (arch.cols - 1) * colW + NODE_W;
  const height = PAD_Y * 2 + (arch.rows - 1) * rowH + NODE_H;
  const pos: Layout["pos"] = {};
  for (const n of arch.nodes) {
    pos[n.id] = { x: PAD_X + n.col * colW, y: PAD_Y + n.row * rowH };
  }
  const byId = new Map(arch.nodes.map((n) => [n.id, n]));
  const edges = arch.edges.map((e) => ({
    ...e,
    id: `e-${e.from}-${e.to}`,
    d: edgePath(byId.get(e.from)!, byId.get(e.to)!, pos),
  }));

  let flowD = "";
  for (let i = 0; i < arch.flow.length - 1; i++) {
    const a = arch.flow[i];
    const b = arch.flow[i + 1];
    const seg = edgePath(byId.get(a)!, byId.get(b)!, pos);
    flowD += i === 0 ? seg : seg.replace(/^M[^C]*/, "");
  }
  return { width, height, colW, rowH, pos, edges, flowD };
}

function edgePath(a: ArchNode, b: ArchNode, pos: Layout["pos"]) {
  const pa = pos[a.id];
  const pb = pos[b.id];
  if (a.col !== b.col) {
    const forward = b.col > a.col;
    const x1 = forward ? pa.x + NODE_W : pa.x;
    const y1 = pa.y + NODE_H / 2;
    const x2 = forward ? pb.x : pb.x + NODE_W;
    const y2 = pb.y + NODE_H / 2;
    const dx = (x2 - x1) * 0.5;
    return `M${x1} ${y1} C${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
  }
  const down = b.row > a.row;
  const x1 = pa.x + NODE_W / 2;
  const y1 = down ? pa.y + NODE_H : pa.y;
  const x2 = pb.x + NODE_W / 2;
  const y2 = down ? pb.y : pb.y + NODE_H;
  const dy = (y2 - y1) * 0.5;
  return `M${x1} ${y1} C${x1} ${y1 + dy}, ${x2} ${y2 - dy}, ${x2} ${y2}`;
}
