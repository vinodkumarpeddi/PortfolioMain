export type NodeKind = "client" | "service" | "queue" | "worker" | "db" | "external" | "infra";

export type ArchNode = {
  id: string;
  label: string;
  sub?: string;
  kind: NodeKind;
  /** column index in the diagram grid (0 = left) */
  col: number;
  /** row index in the diagram grid (0 = top) */
  row: number;
};

export type ArchEdge = {
  from: string;
  to: string;
  label?: string;
  dashed?: boolean;
};

export type Architecture = {
  cols: number;
  rows: number;
  nodes: ArchNode[];
  edges: ArchEdge[];
  /** ordered node ids the animated packet travels through */
  flow: string[];
};

export type ProjectImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type ProjectLayout = "hero" | "architecture" | "split" | "horizontal" | "compact";

export type CaseStudySection = {
  title: string;
  body: string[];
  code?: { language: string; caption?: string; source: string };
};

export type CaseStudy = {
  overview: string[];
  problem: string[];
  architectureNotes: string[];
  implementation: CaseStudySection[];
  challenges: { title: string; body: string }[];
  decisions: { title: string; body: string }[];
  result: string[];
  lessons: string[];
};

export type Project = {
  slug: string;
  number: string;
  title: string;
  category: string;
  tagline: string;
  description: string;
  technologies: string[];
  year: string;
  layout: ProjectLayout;
  image?: ProjectImage;
  github?: string;
  live?: string;
  video?: string;
  architecture?: Architecture;
  challenge?: { title: string; body: string };
  solution?: { title: string; body: string };
  facts: { label: string; value: string }[];
  caseStudy?: CaseStudy;
};

export type IndexProject = {
  title: string;
  summary: string;
  technologies: string[];
  github: string;
  live?: string;
  kind: string;
};
