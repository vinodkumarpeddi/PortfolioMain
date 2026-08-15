export type Milestone = {
  id: string;
  period: string;
  start: string;
  end?: string;
  kind: "work" | "education" | "build";
  org: string;
  role: string;
  location?: string;
  summary: string;
  points: string[];
  systems?: string[];
  technologies: string[];
  link?: string;
};

export const milestones: Milestone[] = [
  {
    id: "aditya",
    period: "2022 — 2026",
    start: "2022",
    end: "2026",
    kind: "education",
    org: "Aditya Engineering College",
    role: "B.Tech, Information Technology",
    location: "Surampalem, Andhra Pradesh",
    summary: "CGPA 8.4. Foundations in data structures, operating systems, networks and databases — and the start of building real systems outside coursework.",
    points: [
      "300+ problems on LeetCode, 100+ on GeeksforGeeks",
      "Certifications across ServiceNow, Cisco networking and JavaScript, Pearson IT Specialist, NPTEL cloud and IoT",
    ],
    technologies: ["C", "C++", "Java", "SQL", "DBMS", "OS", "Networks"],
  },
  {
    id: "technical-hub",
    period: "Dec 2024 — Jan 2025",
    start: "2024-12",
    end: "2025-01",
    kind: "work",
    org: "Technical Hub",
    role: "Full Stack Developer Intern",
    location: "Surampalem, Andhra Pradesh",
    summary: "Built interactive, responsive web applications end to end: React front ends, Node.js APIs and MongoDB / MySQL data layers.",
    points: [
      "Implemented authentication and authorization with JWT and OAuth",
      "Integrated RESTful APIs between front end and back end",
      "Worked with MongoDB and MySQL for data management",
    ],
    systems: ["Auth", "REST APIs", "Data modelling"],
    technologies: ["HTML", "CSS", "JavaScript", "React", "Node.js", "MongoDB", "MySQL", "JWT", "OAuth"],
  },
  {
    id: "servicenow",
    period: "2025",
    start: "2025-02",
    end: "2025",
    kind: "work",
    org: "ServiceNow",
    role: "ServiceNow Developer Intern",
    location: "Remote",
    summary: "Platform engineering on ServiceNow: scoped applications, automated workflows and access control on top of a governed data model.",
    points: [
      "Developed scoped applications with App Engine Studio and Script Includes",
      "Built Service Catalog items, Record Producers and Workflows to automate service requests",
      "Automated approvals and tasks with Flow Designer, improving incident resolution time",
      "Implemented access control with ACLs and role-based permissions",
      "Designed UI Policies, UI Actions and Client Scripts; worked on table schema and data modelling",
    ],
    systems: ["Workflow automation", "RBAC · ACLs", "Data modelling"],
    technologies: ["ServiceNow", "App Engine Studio", "Flow Designer", "Script Includes", "ACLs", "JavaScript"],
  },
  {
    id: "systems",
    period: "2025 — 2026",
    start: "2025-06",
    end: "2026",
    kind: "build",
    org: "Independent systems work",
    role: "Distributed systems · payments · SaaS",
    summary: "A run of production-shaped backend systems, each containerised and documented: payment orchestration, CQRS analytics, event-driven order processing, multi-tenant SaaS, real-time monitoring.",
    points: [
      "Payment Orchestrator — Redis/BullMQ engine, idempotency keys, webhooks with backoff, refund ledger",
      "Event-Driven Analytics — CQRS with transactional outbox, RabbitMQ, idempotent consumers, DLQ",
      "Order Processor and User Activity services — RabbitMQ consumers, rate limiting, health checks, tests",
      "Multi-Tenant SaaS and SaaS Analytics — RBAC, tenant isolation, plan limits, Prisma, SSE",
    ],
    systems: ["Queues", "Idempotency", "Outbox", "RBAC", "Observability"],
    technologies: ["Node.js", "PostgreSQL", "Redis", "RabbitMQ", "Docker", "Next.js", "TypeScript"],
    link: "https://github.com/vinodkumarpeddi",
  },
  {
    id: "everuptime",
    period: "Present",
    start: "2026",
    kind: "work",
    org: "EverUptime",
    role: "Software Engineer",
    summary:
      "Current role. EverUptime is an end-to-end incident management and observability platform for developers, DevOps and SREs — uptime monitoring and on-call management built to minimise downtime.",
    points: [],
    systems: ["Reliability", "Observability", "Incident management"],
    technologies: [],
    link: "https://www.linkedin.com/company/everuptime",
  },
];

export const education = [
  {
    org: "Aditya Engineering College, Surampalem",
    program: "B.Tech — Information Technology",
    period: "2022 — 2026",
    note: "CGPA 8.4",
  },
  {
    org: "Sri Chaitanya Junior College, Nandigama",
    program: "Intermediate — M.P.C",
    period: "2020 — 2022",
    note: "CGPA 9.8",
  },
];

export const certifications = [
  { issuer: "ServiceNow", items: ["Certified System Administrator (CSA)", "Certified Application Developer (CAD)", "Micro-Certification"] },
  { issuer: "Cisco", items: ["Introduction to Networks", "JavaScript Essentials 1", "JavaScript Essentials 2"] },
  { issuer: "Certiport · Pearson", items: ["IT Specialist — HTML & CSS", "IT Specialist — JavaScript"] },
  { issuer: "Infosys Springboard", items: ["DBMS Part 1", "DBMS Part 2"] },
  { issuer: "NPTEL", items: ["Cloud Computing", "Introduction to IoT 4.0"] },
  { issuer: "Spoken Tutorial", items: ["C", "Java"] },
];
