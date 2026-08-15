export type Principle = {
  id: string;
  word: string;
  index: string;
  line: string;
  proof: string;
};

export const principles: Principle[] = [
  {
    id: "performance",
    word: "Performance",
    index: "01",
    line: "Fast systems should feel fast.",
    proof: "APIs return 202 and hand work to a queue; reads come from materialized views, not joins.",
  },
  {
    id: "reliability",
    word: "Reliability",
    index: "02",
    line: "Assume the network fails. Then design.",
    proof: "Acknowledgements, retries with backoff, idempotent consumers, dead-letter queues.",
  },
  {
    id: "scalability",
    word: "Scalability",
    index: "03",
    line: "Decouple, so each part can grow alone.",
    proof: "Workers scale horizontally behind a broker; the API never waits on the bank.",
  },
  {
    id: "observability",
    word: "Observability",
    index: "04",
    line: "If it isn't measured, it isn't done.",
    proof: "Health endpoints that check every dependency; structured logs with the ids that matter.",
  },
  {
    id: "security",
    word: "Security",
    index: "05",
    line: "Every route has a role. Every tenant has a wall.",
    proof: "JWT identity, per-route RBAC and tenant middleware — enforced in one place, not remembered in many.",
  },
  {
    id: "simplicity",
    word: "Simplicity",
    index: "06",
    line: "If it fits in one diagram, it will ship.",
    proof: "Small services with clear contracts; one docker-compose up from clone to running system.",
  },
];
