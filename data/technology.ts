export type TechBranch = "frontend" | "backend" | "data" | "infrastructure" | "systems";

export type Technology = {
  id: string;
  name: string;
  branch: TechBranch;
  usage: string;
  /** slugs from data/projects.ts or titles from indexProjects; used to highlight connections */
  projects: string[];
};

export const branches: { id: TechBranch; label: string; index: string }[] = [
  { id: "frontend", label: "Frontend", index: "01" },
  { id: "backend", label: "Backend", index: "02" },
  { id: "data", label: "Data", index: "03" },
  { id: "infrastructure", label: "Infrastructure", index: "04" },
  { id: "systems", label: "Systems", index: "05" },
];

export const technologies: Technology[] = [
  { id: "react", name: "React", branch: "frontend", usage: "Dashboards, checkout and admin surfaces — from the payment merchant dashboard to exam administration.", projects: ["payment-orchestrator", "exam-seating-management", "multi-tenant-saas", "MindQuest", "PowerX"] },
  { id: "nextjs", name: "Next.js", branch: "frontend", usage: "App Router products with server components, custom servers for WebSockets, and this site.", projects: ["grillbot", "Real-Time FTP Monitor", "SaaS Analytics Dashboard", "Tempo"] },
  { id: "typescript", name: "TypeScript", branch: "frontend", usage: "Typed front ends and Node services; the diffing engine and socket layer of the FTP monitor.", projects: ["Real-Time FTP Monitor", "SaaS Analytics Dashboard", "Tempo"] },
  { id: "react-native", name: "React Native", branch: "frontend", usage: "Faculty and student mobile apps for exam duties, attendance and notifications.", projects: ["exam-seating-management"] },
  { id: "tailwind", name: "Tailwind CSS", branch: "frontend", usage: "Design-token driven styling across products and this portfolio.", projects: ["grillbot", "multi-tenant-saas", "MindQuest"] },

  { id: "node", name: "Node.js", branch: "backend", usage: "The runtime behind every API, worker and consumer in the systems work.", projects: ["payment-orchestrator", "event-driven-analytics", "exam-seating-management", "multi-tenant-saas", "Order Processor Service", "User Activity Service"] },
  { id: "express", name: "Express", branch: "backend", usage: "REST APIs with auth, validation and middleware chains for RBAC and tenant isolation.", projects: ["payment-orchestrator", "event-driven-analytics", "exam-seating-management", "multi-tenant-saas", "grillbot"] },
  { id: "auth", name: "JWT · OAuth · RBAC", branch: "backend", usage: "Identity plus per-route role checks; tenant guards; ServiceNow ACLs on the platform side.", projects: ["exam-seating-management", "multi-tenant-saas", "grillbot", "SaaS Analytics Dashboard"] },
  { id: "python", name: "Python · FastAPI", branch: "backend", usage: "LLM routing service, the MindQuest clustering service and Excel ingestion with openpyxl.", projects: ["LLM Prompt Router", "MindQuest", "exam-seating-management"] },
  { id: "websockets", name: "Socket.IO · SSE", branch: "backend", usage: "Live file-system diffs, collaborative canvases and streaming dashboard updates.", projects: ["Real-Time FTP Monitor", "MindQuest", "SaaS Analytics Dashboard"] },
  { id: "java", name: "Java · C++", branch: "backend", usage: "Algorithms and data structures — 300+ LeetCode, 100+ GeeksforGeeks problems.", projects: [] },

  { id: "postgres", name: "PostgreSQL", branch: "data", usage: "Ledgers, orders, tenant-scoped schemas, and separate write/read stores for CQRS.", projects: ["payment-orchestrator", "event-driven-analytics", "multi-tenant-saas", "Order Processor Service", "SaaS Analytics Dashboard"] },
  { id: "mongodb", name: "MongoDB", branch: "data", usage: "Flexible documents for exams, activity events, interviews and brainstorming sessions.", projects: ["exam-seating-management", "grillbot", "User Activity Service", "MindQuest", "PowerX"] },
  { id: "redis", name: "Redis", branch: "data", usage: "Backing store for the BullMQ payment queue — durable jobs, retries and a clean worker boundary.", projects: ["payment-orchestrator"] },
  { id: "prisma", name: "Prisma", branch: "data", usage: "Schema-first data access for the analytics dashboard and Tempo.", projects: ["SaaS Analytics Dashboard", "Tempo"] },
  { id: "views", name: "Materialized views", branch: "data", usage: "Pre-computed read models so analytics queries never join the transactional schema.", projects: ["event-driven-analytics"] },

  { id: "docker", name: "Docker · Compose", branch: "infrastructure", usage: "Every system boots with one command: api, workers, brokers, databases, front ends.", projects: ["payment-orchestrator", "event-driven-analytics", "multi-tenant-saas", "Order Processor Service", "User Activity Service", "Real-Time FTP Monitor", "LLM Prompt Router"] },
  { id: "vercel", name: "Vercel", branch: "infrastructure", usage: "Deployment for the product front ends and this portfolio.", projects: ["exam-seating-management", "grillbot", "MindQuest", "PowerX", "Tempo"] },
  { id: "servicenow", name: "ServiceNow", branch: "infrastructure", usage: "Scoped apps, Flow Designer automation and ACLs — plus incident integration from Exam Seating.", projects: ["exam-seating-management"] },
  { id: "health", name: "Health checks · logs", branch: "infrastructure", usage: "/health endpoints that verify broker and database connectivity; structured JSON logs.", projects: ["Order Processor Service", "User Activity Service", "event-driven-analytics"] },

  { id: "rabbitmq", name: "RabbitMQ", branch: "systems", usage: "Durable queues, acknowledgements and dead-lettering between producers and consumers.", projects: ["event-driven-analytics", "Order Processor Service", "User Activity Service"] },
  { id: "bullmq", name: "BullMQ · job queues", branch: "systems", usage: "Async payment processing so request latency is independent of bank latency.", projects: ["payment-orchestrator"] },
  { id: "idempotency", name: "Idempotency", branch: "systems", usage: "Idempotency keys, unique constraints and processed-event tables so retries never double-process.", projects: ["payment-orchestrator", "event-driven-analytics", "Order Processor Service", "User Activity Service"] },
  { id: "outbox", name: "Transactional outbox", branch: "systems", usage: "Events committed with the business write, then relayed — no lost events between DB and broker.", projects: ["event-driven-analytics"] },
  { id: "retries", name: "Retries · backoff", branch: "systems", usage: "Webhook delivery with exponential backoff; nack-and-requeue for transient failures.", projects: ["payment-orchestrator", "Order Processor Service"] },
  { id: "rate-limit", name: "Rate limiting", branch: "systems", usage: "Sliding-window limiter per IP in front of the ingestion API.", projects: ["User Activity Service"] },
  { id: "dlq", name: "Dead-letter queues", branch: "systems", usage: "Poison messages are parked for inspection instead of blocking the queue.", projects: ["event-driven-analytics", "Order Processor Service"] },
];
