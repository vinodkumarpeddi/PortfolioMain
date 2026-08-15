import type { Architecture, IndexProject, Project } from "./types";

export const heroArchitecture: Architecture = {
  cols: 5,
  rows: 3,
  nodes: [
    { id: "client", label: "Client", sub: "browser · mobile", kind: "client", col: 0, row: 1 },
    { id: "api", label: "API", sub: "REST · auth", kind: "service", col: 1, row: 1 },
    { id: "svc", label: "Services", sub: "domain logic", kind: "service", col: 2, row: 0 },
    { id: "queue", label: "Queue", sub: "async · durable", kind: "queue", col: 2, row: 2 },
    { id: "worker", label: "Workers", sub: "idempotent", kind: "worker", col: 3, row: 2 },
    { id: "db", label: "Database", sub: "postgres · mongo", kind: "db", col: 3, row: 0 },
    { id: "infra", label: "Infra", sub: "docker · cloud", kind: "infra", col: 4, row: 1 },
  ],
  edges: [
    { from: "client", to: "api" },
    { from: "api", to: "svc" },
    { from: "api", to: "queue" },
    { from: "queue", to: "worker" },
    { from: "svc", to: "db" },
    { from: "worker", to: "db" },
    { from: "worker", to: "infra" },
    { from: "db", to: "infra", dashed: true },
  ],
  flow: ["client", "api", "queue", "worker", "db", "infra"],
};

const paymentArchitecture: Architecture = {
  cols: 5,
  rows: 3,
  nodes: [
    { id: "checkout", label: "Checkout", sub: "UPI · card · Luhn", kind: "client", col: 0, row: 1 },
    { id: "api", label: "Merchant API", sub: "express · api keys", kind: "service", col: 1, row: 1 },
    { id: "orders", label: "Orders", sub: "idempotency keys", kind: "service", col: 2, row: 0 },
    { id: "queue", label: "Redis · BullMQ", sub: "job queue", kind: "queue", col: 2, row: 2 },
    { id: "worker", label: "Payment worker", sub: "fault injection", kind: "worker", col: 3, row: 2 },
    { id: "db", label: "PostgreSQL", sub: "ledger · refunds", kind: "db", col: 3, row: 0 },
    { id: "webhook", label: "Webhooks", sub: "backoff ×5", kind: "external", col: 4, row: 1 },
  ],
  edges: [
    { from: "checkout", to: "api" },
    { from: "api", to: "orders" },
    { from: "api", to: "queue" },
    { from: "queue", to: "worker" },
    { from: "orders", to: "db" },
    { from: "worker", to: "db" },
    { from: "worker", to: "webhook", label: "retry" },
    { from: "db", to: "webhook", dashed: true },
  ],
  flow: ["checkout", "api", "queue", "worker", "db", "webhook"],
};

const cqrsArchitecture: Architecture = {
  cols: 5,
  rows: 3,
  nodes: [
    { id: "client", label: "Client", sub: "commands", kind: "client", col: 0, row: 0 },
    { id: "cmd", label: "Command service", sub: ":8080", kind: "service", col: 1, row: 0 },
    { id: "wdb", label: "Write DB", sub: "postgres · outbox", kind: "db", col: 2, row: 0 },
    { id: "mq", label: "RabbitMQ", sub: "at-least-once · DLQ", kind: "queue", col: 2, row: 1 },
    { id: "consumer", label: "Consumer", sub: "idempotent", kind: "worker", col: 3, row: 1 },
    { id: "rdb", label: "Read DB", sub: "materialized views", kind: "db", col: 3, row: 2 },
    { id: "query", label: "Query service", sub: ":8081", kind: "service", col: 4, row: 2 },
  ],
  edges: [
    { from: "client", to: "cmd" },
    { from: "cmd", to: "wdb", label: "1 txn" },
    { from: "wdb", to: "mq", label: "outbox relay" },
    { from: "mq", to: "consumer" },
    { from: "consumer", to: "rdb" },
    { from: "rdb", to: "query" },
  ],
  flow: ["client", "cmd", "wdb", "mq", "consumer", "rdb", "query"],
};

const examArchitecture: Architecture = {
  cols: 4,
  rows: 3,
  nodes: [
    { id: "web", label: "Web app", sub: "react · admin", kind: "client", col: 0, row: 0 },
    { id: "mobile", label: "Mobile", sub: "react native", kind: "client", col: 0, row: 2 },
    { id: "api", label: "API", sub: "express · JWT · RBAC", kind: "service", col: 1, row: 1 },
    { id: "db", label: "MongoDB", sub: "exams · rooms · users", kind: "db", col: 2, row: 0 },
    { id: "mail", label: "Email", sub: "absentees · alerts", kind: "external", col: 2, row: 2 },
    { id: "snow", label: "ServiceNow", sub: "incidents", kind: "external", col: 3, row: 1 },
  ],
  edges: [
    { from: "web", to: "api" },
    { from: "mobile", to: "api" },
    { from: "api", to: "db" },
    { from: "api", to: "mail" },
    { from: "api", to: "snow", label: "tickets", dashed: true },
  ],
  flow: ["web", "api", "db"],
};

const saasArchitecture: Architecture = {
  cols: 4,
  rows: 3,
  nodes: [
    { id: "client", label: "React client", sub: "protected routes", kind: "client", col: 0, row: 1 },
    { id: "auth", label: "JWT", sub: "identity", kind: "service", col: 1, row: 0 },
    { id: "rbac", label: "RBAC", sub: "role guard", kind: "service", col: 1, row: 1 },
    { id: "tenant", label: "Tenant guard", sub: "isolation", kind: "service", col: 1, row: 2 },
    { id: "api", label: "Express API", sub: "plan limits", kind: "service", col: 2, row: 1 },
    { id: "db", label: "PostgreSQL", sub: "tenant-scoped", kind: "db", col: 3, row: 1 },
  ],
  edges: [
    { from: "client", to: "auth" },
    { from: "auth", to: "rbac" },
    { from: "rbac", to: "tenant" },
    { from: "tenant", to: "api" },
    { from: "api", to: "db" },
  ],
  flow: ["client", "auth", "rbac", "tenant", "api", "db"],
};

export const projects: Project[] = [
  {
    slug: "payment-orchestrator",
    number: "01",
    title: "Payment Orchestrator",
    category: "Payments · Distributed systems",
    tagline:
      "A Stripe-style payment gateway with an asynchronous processing engine, resilient webhooks and idempotent APIs.",
    description:
      "Merchant API, hosted checkout and merchant dashboard run as separate services. Payments flow through a Redis-backed BullMQ queue so the API never blocks; webhooks retry with exponential backoff; refunds reconcile against a ledger.",
    technologies: ["Node.js", "Express", "PostgreSQL 15", "Redis 7", "BullMQ", "React", "Vite", "Docker Compose"],
    year: "2026",
    layout: "hero",
    github: "https://github.com/vinodkumarpeddi/Payment",
    architecture: paymentArchitecture,
    challenge: {
      title: "Consistency under failure",
      body: "Payment state has to agree across the merchant dashboard, the customer's checkout session and an asynchronous engine — while a simulated bank injects latency and failures.",
    },
    solution: {
      title: "Queue, idempotency, retry",
      body: "Idempotency keys reject duplicate transactions. A Redis job queue decouples request latency from processing. Webhooks retry with exponential backoff up to five attempts, and refunds — partial or full — reconcile against the ledger.",
    },
    facts: [
      { label: "Services", value: "api · worker · db · redis · dashboard · checkout" },
      { label: "Pattern", value: "Async job queue · idempotency keys · webhook retry" },
      { label: "Data", value: "PostgreSQL ledger with refund reconciliation" },
    ],
    caseStudy: {
      overview: [
        "Payment Orchestrator replicates the shape of a real payment processor: a merchant onboards, receives API credentials, creates orders through a REST API, sends customers to a hosted checkout, and watches transactions settle on a dashboard.",
        "Six containers make up the system — api, worker, db, redis, dashboard and checkout — orchestrated with Docker Compose. A test merchant is seeded on startup so the full flow can be exercised with a single curl and a browser.",
      ],
      problem: [
        "A payment is not a single request. It is a lifecycle: order created, checkout opened, payment attempted, bank responds (eventually), merchant notified, maybe refunded. Every one of those steps can fail, be retried, or arrive twice.",
        "The dashboard, the checkout page and the processing engine all read and write that lifecycle. If they disagree, a customer sees 'paid' while a merchant sees 'pending' — the exact class of inconsistency this project was built to handle.",
      ],
      architectureNotes: [
        "The API accepts orders and payments and immediately enqueues processing on a Redis-backed BullMQ queue, so request latency is independent of bank latency.",
        "A dedicated worker consumes the queue, runs the payment engine (with fault injection for latency and bank failures), writes results to PostgreSQL and schedules webhook delivery.",
        "Hosted checkout is an isolated micro-frontend that supports UPI and card (with Luhn validation) and polls the API for status. The merchant dashboard is a separate React app with analytics, history and credential management.",
      ],
      implementation: [
        {
          title: "Order creation with API credentials",
          body: [
            "Merchant requests authenticate with an API key and secret sent as headers. Amounts are integers in the smallest currency unit.",
          ],
          code: {
            language: "bash",
            caption: "Creating an order against the merchant API",
            source: `curl -X POST http://localhost:8000/api/v1/orders \\
  -H "Content-Type: application/json" \\
  -H "X-Api-Key: key_test_abc123" \\
  -H "X-Api-Secret: secret_test_xyz789" \\
  -d '{"amount": 50000, "currency": "INR", "receipt": "demo_1"}'`,
          },
        },
        {
          title: "Async payment engine",
          body: [
            "Instead of processing inside the request, the API enqueues a job. The worker picks it up, simulates the bank round-trip, and persists the outcome — PROCESSED, FAILED or otherwise — before notifying the merchant.",
          ],
        },
        {
          title: "Resilient webhooks",
          body: [
            "Merchant notifications are delivered by a retry loop with exponential backoff, up to five attempts. Failed deliveries never block the payment itself.",
          ],
        },
        {
          title: "Refunds and the ledger",
          body: [
            "Partial and full refunds are first-class operations reconciled against a ledger, so the dashboard's numbers are derived from the same records the engine wrote.",
          ],
        },
      ],
      challenges: [
        {
          title: "Duplicate requests",
          body: "Retries from a flaky client or a double-clicked pay button must not create two charges. Idempotency keys make repeated requests return the original result.",
        },
        {
          title: "Bank latency and failure",
          body: "Fault injection simulates slow and failing bank responses; the queue absorbs the latency and the status polling on checkout keeps the customer informed.",
        },
        {
          title: "Three surfaces, one truth",
          body: "Dashboard, checkout and worker share PostgreSQL as the single source of truth; the queue carries intent, the database carries state.",
        },
      ],
      decisions: [
        {
          title: "Redis + BullMQ over an in-process queue",
          body: "A real broker gives durability, retries and a clean worker boundary that can be scaled independently of the API.",
        },
        {
          title: "Separate checkout micro-frontend",
          body: "Isolating checkout mirrors how hosted checkout pages work in production and keeps card handling out of the merchant dashboard.",
        },
        {
          title: "PostgreSQL for the ledger",
          body: "Financial records want transactions, constraints and reconciliation queries — a relational store is the natural fit.",
        },
      ],
      result: [
        "A reproducible, containerised payment system that demonstrates the hard parts — asynchronous processing, idempotency, retries with backoff and refund reconciliation — end to end, from `docker-compose up` to a settled transaction on the dashboard.",
      ],
      lessons: [
        "The queue is not an optimisation; it is the boundary that makes the rest of the system reasonable.",
        "Idempotency has to be designed at the API contract level, not bolted on later.",
        "Fault injection during development surfaces the failure paths that tests written for the happy path never will.",
      ],
    },
  },
  {
    slug: "event-driven-analytics",
    number: "02",
    title: "Event-Driven Analytics",
    category: "CQRS · Event-driven architecture",
    tagline:
      "An e-commerce analytics backend that separates writes from reads with a transactional outbox and RabbitMQ.",
    description:
      "A command service persists orders and products to a normalised write model; a transactional outbox relays events through RabbitMQ to a consumer that maintains denormalised materialized views for a separate query service.",
    technologies: ["Node.js", "Express", "amqplib", "RabbitMQ 3", "PostgreSQL 14 ×2", "Docker Compose"],
    year: "2026",
    layout: "architecture",
    github: "https://github.com/vinodkumarpeddi/Event-Driven-Analytics-System-with-a-Message-Broker",
    architecture: cqrsArchitecture,
    challenge: {
      title: "The dual-write problem",
      body: "Committing a database write and publishing an event are two operations. If either fails on its own, the read side silently drifts from the write side.",
    },
    solution: {
      title: "Transactional outbox",
      body: "Events are written to an outbox table in the same transaction as the business data, then relayed to RabbitMQ — at-least-once delivery. Idempotent consumers absorb duplicates via a processed_events table, and poison messages land in a dead-letter queue.",
    },
    facts: [
      { label: "Pattern", value: "CQRS · transactional outbox · materialized views" },
      { label: "Guarantees", value: "At-least-once delivery · idempotent consumers · DLQ" },
      { label: "Services", value: "command :8080 · consumer · query :8081" },
    ],
    caseStudy: {
      overview: [
        "The system separates the write path (creating products and orders) from the read path (sales analytics) using CQRS. Each side has its own PostgreSQL database and its own service, connected by RabbitMQ.",
        "Analytics queries hit pre-computed materialized views instead of joining across the transactional schema, keeping reads fast regardless of write volume.",
      ],
      problem: [
        "Analytics workloads and transactional workloads want different shapes of data. A normalised write model is good for consistency and terrible for aggregate queries; a denormalised read model is the reverse.",
        "Keeping the two in sync asynchronously introduces the dual-write problem: a service that writes to its database and then publishes to a broker can crash between the two and lose the event forever.",
      ],
      architectureNotes: [
        "Command Service (:8080) exposes POST /api/products and POST /api/orders. Each command writes business rows and an outbox row in one transaction.",
        "An outbox publisher relays unpublished outbox rows to RabbitMQ, guaranteeing at-least-once delivery.",
        "Consumer Service subscribes to the exchange, updates the read database and records each event id in processed_events so redelivered messages are ignored. Failures route to a dead-letter queue.",
        "Query Service (:8081) serves analytics such as GET /api/analytics/products/{id}/sales from materialized views.",
      ],
      implementation: [
        {
          title: "Command with outbox",
          body: [
            "The business write and the outbox insert are wrapped in a single transaction; if either fails, neither is committed.",
          ],
          code: {
            language: "sql",
            caption: "Shape of a command transaction",
            source: `BEGIN;
INSERT INTO orders (customer_id, total) VALUES ($1, $2) RETURNING id;
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ...;
INSERT INTO outbox (aggregate_id, event_type, payload)
  VALUES ($order_id, 'OrderCreated', $payload);
COMMIT;`,
          },
        },
        {
          title: "Idempotent consumption",
          body: [
            "Because delivery is at-least-once, the consumer must tolerate duplicates. Each processed event id is stored; a repeat is acknowledged and skipped.",
          ],
        },
        {
          title: "Materialized read models",
          body: [
            "The read database holds pre-aggregated per-product sales figures, refreshed by the consumer as events arrive, so the query service does no heavy joins at request time.",
          ],
        },
      ],
      challenges: [
        {
          title: "Losing events between DB and broker",
          body: "Solved by the outbox: the event is durable the moment the transaction commits, and the relay can be retried safely.",
        },
        {
          title: "Duplicate deliveries",
          body: "At-least-once implies duplicates. The processed_events table makes the consumer idempotent.",
        },
        {
          title: "Poison messages",
          body: "Malformed or repeatedly failing messages are routed to a DLQ for inspection instead of blocking the queue.",
        },
      ],
      decisions: [
        {
          title: "Two databases, not two schemas",
          body: "Physically separating the read and write stores makes the isolation explicit and lets each be tuned independently.",
        },
        {
          title: "Outbox over dual writes",
          body: "Simpler alternatives (publish after commit) are exactly the failure mode the pattern exists to remove.",
        },
        {
          title: "RabbitMQ",
          body: "A mature broker with acknowledgements, durable queues and dead-lettering built in.",
        },
      ],
      result: [
        "A containerised CQRS system where writes stay normalised, reads stay fast, and the path between them survives crashes and redeliveries.",
      ],
      lessons: [
        "Consistency in event-driven systems is a design decision made at the transaction boundary.",
        "Idempotency and dead-lettering are not optional extras — they are what make at-least-once delivery usable.",
      ],
    },
  },
  {
    slug: "exam-seating-management",
    number: "03",
    title: "Exam Seating Management",
    category: "Full-stack product · Web + mobile",
    tagline:
      "A web and mobile platform for exam scheduling, seat allocation, faculty assignment and attendance tracking.",
    description:
      "Admins schedule exams, manage rooms and blocks, assign invigilators and send automated emails. Faculty and students get their own web and React Native dashboards with allocations, attendance and notifications. Bulk student uploads run through Python validation, and system issues open ServiceNow incidents automatically.",
    technologies: ["React", "React Native", "Node.js", "Express", "MongoDB", "Python · openpyxl", "ServiceNow", "JWT · RBAC"],
    year: "2025",
    layout: "split",
    image: { src: "/work/exam-seating.png", alt: "Exam Seating Management admin dashboard, faculty allocation and login screens", width: 1080, height: 1080 },
    github: "https://github.com/vinodkumarpeddi/ExamSeating",
    live: "https://exam-seating-management.vercel.app/",
    architecture: examArchitecture,
    facts: [
      { label: "Roles", value: "Admin · Faculty · Student" },
      { label: "Surfaces", value: "Web dashboards · React Native apps" },
      { label: "Integrations", value: "Email automation · ServiceNow incidents · Excel import" },
    ],
    caseStudy: {
      overview: [
        "Exam Seating Management replaces the manual coordination behind exam day: which exam is in which room, which faculty member invigilates, who was absent, and who needs to be told what.",
        "It ships as a web application and React Native apps for faculty and students, backed by one Node.js API and MongoDB.",
      ],
      problem: [
        "Exam operations involve three groups with different needs. Admins plan and react; faculty need their duties and a way to mark attendance; students need today's room and schedule — all from the same underlying data.",
        "Data enters in bulk (student lists in Excel) and errors surface at the worst time — during an exam.",
      ],
      architectureNotes: [
        "A single Express API with JWT authentication and role-based access control serves both the web app and the mobile apps.",
        "MongoDB stores exams, rooms and blocks, allocations, users and attendance.",
        "Automated email notifies absentees and malpractice cases; a ServiceNow integration opens incidents for system errors and user-reported problems.",
        "Bulk student uploads are parsed with Python (openpyxl) and validated on the backend before touching the database.",
      ],
      implementation: [
        {
          title: "Admin dashboard",
          body: ["Schedule exams, manage rooms and blocks, assign invigilators, add users by role and export lists to Excel."],
        },
        {
          title: "Faculty and student dashboards",
          body: [
            "Faculty see allocations, mark attendance and get notified about duties. Students see today's exams, upcoming schedules and room information with real-time notifications — on web and mobile.",
          ],
        },
        {
          title: "Access control",
          body: ["Every route is scoped by role; JWTs carry identity and the API enforces what each role may read or change."],
        },
      ],
      challenges: [
        { title: "Three audiences, one API", body: "Solved with role-based routes and per-role dashboards rather than three backends." },
        { title: "Messy bulk data", body: "Excel imports go through validation before persistence so bad rows never reach the schedule." },
        { title: "Support during exams", body: "System errors create ServiceNow incidents automatically instead of relying on someone noticing." },
      ],
      decisions: [
        { title: "React Native for faculty and students", body: "Attendance is taken in a room, not at a desk; mobile is the primary surface for those roles." },
        { title: "MongoDB", body: "Flexible documents suit allocations and schedules that change shape by exam type." },
      ],
      result: [
        "A deployed system covering the full exam-day workflow — scheduling, allocation, attendance, notifications and incident tracking — across web and mobile.",
      ],
      lessons: [
        "Role-based access is easiest when it is designed into the API from the first route.",
        "Validating data at the boundary is cheaper than cleaning it in the database.",
      ],
    },
  },
  {
    slug: "multi-tenant-saas",
    number: "04",
    title: "Multi-Tenant SaaS Platform",
    category: "SaaS · Access control",
    tagline: "A role-based multi-tenant platform where every query is scoped to a tenant and every route to a role.",
    description:
      "Super admins manage tenants; tenant admins manage users, projects and tasks inside their tenant; users get read-only access. Subscription plans cap users and projects. Migrations and seeds run on container start so the system is usable immediately.",
    technologies: ["Node.js", "Express", "PostgreSQL", "JWT", "React · Vite", "Tailwind CSS", "Docker Compose"],
    year: "2026",
    layout: "horizontal",
    github: "https://github.com/vinodkumarpeddi/Multi-tenant-SAAS",
    video: "https://youtu.be/aHQRZevUIjY",
    architecture: saasArchitecture,
    facts: [
      { label: "Roles", value: "Super admin · Tenant admin · User" },
      { label: "Isolation", value: "Tenant middleware · per-route RBAC" },
      { label: "Limits", value: "Plan-based caps on users and projects" },
    ],
    caseStudy: {
      overview: [
        "A production-style multi-tenant application: one deployment, many organisations, strict isolation. It is fully containerised — backend, frontend and database — and demonstrated in a recorded walkthrough.",
      ],
      problem: [
        "Multi-tenancy is a correctness problem before it is a scaling problem. A single missing tenant filter leaks one organisation's data to another. Roles add a second axis: what a person can do inside their tenant.",
      ],
      architectureNotes: [
        "Authentication middleware extracts identity from the JWT.",
        "RBAC middleware enforces role permissions per route, with read and write permissions separated.",
        "Tenant middleware scopes every query to the caller's tenant; the super admin is deliberately isolated from tenant-scoped data.",
        "Subscription plan limits (users, projects) are enforced in the API and surfaced clearly in the UI.",
      ],
      implementation: [
        { title: "Three roles", body: ["Super Admin: tenants and plans (read-only). Tenant Admin: dashboard, projects, tasks, users within limits. User: read-only dashboard, projects and tasks."] },
        { title: "Error handling", body: ["Consistent backend errors; a global Axios interceptor handles 401 (session expired) and 403 (unauthorized) with toast notifications."] },
        { title: "Zero-step start", body: ["Migrations and seeds run automatically on container startup, creating a super admin, a sample tenant and a tenant admin."] },
      ],
      challenges: [
        { title: "Isolation everywhere", body: "Enforced by middleware, not by remembering to add a WHERE clause in each controller." },
        { title: "Two axes of permission", body: "Role and tenant are checked independently, in order, on every request." },
      ],
      decisions: [
        { title: "Configuration-based plans", body: "No billing UI; plan limits are configuration, keeping the scope focused on isolation and access control." },
        { title: "Super admin without tenant access", body: "The platform operator cannot read tenant data — a deliberate trust boundary." },
      ],
      result: ["A clean multi-tenant reference implementation with proper role separation and tenant isolation, ready to run with one command."],
      lessons: [
        "Put isolation in the middleware layer so it cannot be forgotten.",
        "Separate read and write permissions early — merging them later is painful.",
      ],
    },
  },
  {
    slug: "grillbot",
    number: "05",
    title: "GrillBot",
    category: "AI product · Mock interviews",
    tagline: "AI mock interviews: generated questions, recorded answers, automated feedback.",
    description:
      "GrillBot generates interview questions with the Gemini API for a chosen role, stack and experience level, lets candidates record answers with the camera on or off, and returns rated, per-question feedback.",
    technologies: ["Next.js", "Node.js", "Express", "MongoDB", "Gemini API", "Clerk", "Tailwind CSS"],
    year: "2025",
    layout: "compact",
    image: { src: "/work/grillbot.png", alt: "GrillBot interview setup, webcam permission and feedback screens", width: 1080, height: 1080 },
    github: "https://github.com/vinodkumarpeddi/Grill-Bot",
    live: "https://grillbot.vercel.app",
    facts: [
      { label: "AI", value: "Gemini API question generation and feedback" },
      { label: "Auth", value: "OAuth + JWT" },
    ],
  },
];

export const indexProjects: IndexProject[] = [
  {
    title: "Order Processor Service",
    kind: "Event-driven microservice",
    summary: "Consumes OrderPlaced events from RabbitMQ, validates and persists idempotently, publishes OrderProcessed, routes bad messages to a DLQ. Health endpoint, structured JSON logs, unit + integration tests, horizontally scalable consumers.",
    technologies: ["Node.js", "RabbitMQ", "PostgreSQL", "Docker"],
    github: "https://github.com/vinodkumarpeddi/order-processor-service",
  },
  {
    title: "User Activity Service",
    kind: "Event ingestion",
    summary: "REST API returns 202 and publishes to a durable RabbitMQ queue; a worker persists to MongoDB. Sliding-window rate limiting per IP, ack/nack semantics, unique index for idempotency.",
    technologies: ["Node.js", "RabbitMQ", "MongoDB", "Docker"],
    github: "https://github.com/vinodkumarpeddi/Build-an-Event-Driven-User-Activity-Service-with-RabbitMQ-and-Rate-Limiting",
  },
  {
    title: "Real-Time FTP Monitor",
    kind: "Real-time dashboard",
    summary: "Polls an FTP server, diffs file-system snapshots with a pure O(n) function and pushes changes to browsers over Socket.IO from a custom Next.js server.",
    technologies: ["Next.js 14", "TypeScript", "Socket.IO", "Docker"],
    github: "https://github.com/vinodkumarpeddi/Build-a-Real-Time-FTP-File-System-Monitoring-Dashboard-with-WebSockets",
  },
  {
    title: "LLM Prompt Router",
    kind: "AI service",
    summary: "Classify-then-respond: a fast model labels intent with a confidence score, a larger model answers as the matching expert. Confidence threshold, manual overrides, JSONL request log.",
    technologies: ["Python", "FastAPI", "Groq", "Docker"],
    github: "https://github.com/vinodkumarpeddi/LLM-Powered-Prompt-Router",
  },
  {
    title: "SaaS Analytics Dashboard",
    kind: "Multi-tenant Next.js",
    summary: "Path-based tenant isolation, NextAuth v5 with RBAC, parallel and intercepting routes, streaming RSC, server actions and SSE live updates.",
    technologies: ["Next.js 14", "Prisma", "PostgreSQL", "Docker"],
    github: "https://github.com/vinodkumarpeddi/Saas-Analytics-Dashboard",
  },
  {
    title: "MindQuest",
    kind: "Real-time collaboration + AI",
    summary: "Collaborative brainstorming canvas synced with Socket.IO; a Python service clusters ideas (K-Means, DBSCAN), detects duplicates with TF-IDF similarity and summarises sessions with Gemini.",
    technologies: ["React", "Node.js", "Socket.IO", "Python", "MongoDB"],
    github: "https://github.com/vinodkumarpeddi/MindQuest",
    live: "https://mind-quest-vert.vercel.app",
  },
  {
    title: "Tempo",
    kind: "Team usage dashboard",
    summary: "Machines report Claude usage percentages to a Next.js server; live dashboard, threshold alerts and a daily email report via Resend. Only percentages leave the machine.",
    technologies: ["Next.js", "Prisma", "SQLite", "Resend"],
    github: "https://github.com/vinodkumarpeddi/Tempo",
    live: "https://tempo-ruddy-two.vercel.app",
  },
  {
    title: "PowerX",
    kind: "Fitness platform",
    summary: "Diet logging, calorie tracking, exercise recommendations and progress analytics on a MERN stack.",
    technologies: ["React", "Node.js", "Express", "MongoDB"],
    github: "https://github.com/vinodkumarpeddi/projectPowerX",
    live: "https://power-x-fitness.vercel.app/login",
  },
];

export const featuredSlugs = projects.map((p) => p.slug);
export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
