/** Each project's own colour, used wherever the page takes on a project's key. */
export const projectWash: Record<string, string> = {
  "payment-orchestrator": "#635bff",
  "event-driven-analytics": "#22d3ee",
  "exam-seating-management": "#4c1d95",
  "multi-tenant-saas": "#7c3aed",
  grillbot: "#c026d3",
};

export const washFor = (slug: string | undefined) => (slug && projectWash[slug]) || "#e9a23b";
